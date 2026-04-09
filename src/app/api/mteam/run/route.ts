import { NextResponse } from "next/server";

type RunRequest = {
  userid: string;
  headers: Record<string, string>;
  torrent: {
    pageNumber?: number;
    pageSize?: number;
    timestamp: number;
    sgin: string;
  };
  forum: {
    fid: string;
    authorId: string;
    pageCount?: number;
    pageSize?: number;
    timestamp: number;
    sgin: string;
  };
};

type TorrentItem = {
  id: string | number;
  createdDate?: string;
  name?: string;
  smallDescr?: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function getDataDataArray(json: unknown): unknown[] {
  if (!isRecord(json)) return [];
  const data = json["data"];
  if (!isRecord(data)) return [];
  const inner = data["data"];
  return Array.isArray(inner) ? inner : [];
}

function asStringRecord(input: unknown): Record<string, string> | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
    else if (typeof v === "number" || typeof v === "boolean") out[k] = String(v);
    else if (v == null) continue;
    else return null;
  }
  return out;
}

function redactHeaders(headers: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    const key = k.toLowerCase();
    if (key === "authorization") out[k] = "[REDACTED]";
    else if (key === "cookie") out[k] = "[REDACTED]";
    else out[k] = v;
  }
  return out;
}

async function postJson(url: string, headers: Record<string, string>, body: unknown) {
  const h: Record<string, string> = { ...headers };
  if (!Object.keys(h).some((k) => k.toLowerCase() === "content-type")) {
    h["content-type"] = "application/json";
  }
  const res = await fetch(url, {
    method: "POST",
    headers: h,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    return { ok: false as const, status: res.status, text };
  }
  try {
    return { ok: true as const, json: JSON.parse(text) as unknown };
  } catch {
    return { ok: false as const, status: 502, text: "上游返回非 JSON：" + text.slice(0, 300) };
  }
}

async function getUserTorrentList(params: {
  userid: string;
  pageNumber: number;
  pageSize: number;
  timestamp: number;
  sgin: string;
  headers: Record<string, string>;
}): Promise<{ items: TorrentItem[]; rawCount: number }> {
  const url = "https://api.m-team.io/api/member/getUserTorrentList";
  const data = {
    userid: params.userid,
    type: "UPLOADED",
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
    _timestamp: params.timestamp,
    _sgin: params.sgin,
  };
  const r = await postJson(url, params.headers, data);
  if (!r.ok) throw new Error(`getUserTorrentList 请求失败: ${r.status} ${r.text}`);

  const rows = getDataDataArray(r.json);
  const items: TorrentItem[] = rows
    .map((i) => (isRecord(i) ? i["torrent"] : null))
    .filter((t): t is Record<string, unknown> => isRecord(t))
    .map((t) => {
      const id = t["id"];
      return {
        id: typeof id === "string" || typeof id === "number" ? id : String(id ?? ""),
        createdDate: typeof t["createdDate"] === "string" ? t["createdDate"] : undefined,
        name: typeof t["name"] === "string" ? t["name"] : undefined,
        smallDescr: typeof t["smallDescr"] === "string" ? t["smallDescr"] : undefined,
      };
    });
  return { items, rawCount: rows.length };
}

async function searchForumTopics(params: {
  fid: string;
  authorId: string;
  pageCount: number;
  pageSize: number;
  timestamp: number;
  sgin: string;
  headers: Record<string, string>;
}): Promise<string[]> {
  const url = "https://api.m-team.io/api/forum/topic/search";
  const links: string[] = [];

  for (let page = 1; page <= params.pageCount; page += 1) {
    const data = {
      fid: params.fid,
      pageSize: params.pageSize,
      pageNumber: page,
      _timestamp: params.timestamp,
      _sgin: params.sgin,
    };
    const r = await postJson(url, params.headers, data);
    if (!r.ok) continue;

    const rows = getDataDataArray(r.json);
    for (const i of rows) {
      if (!isRecord(i)) continue;
      if (String(i["author"] ?? "") === String(params.authorId)) {
        const id = i["id"];
        if (id != null) links.push("https://kp.m-team.cc/forum/t/" + String(id));
      }
    }
  }

  return Array.from(new Set(links));
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "请求体必须是 JSON" }, { status: 400 });
  }

  const b = body as Partial<RunRequest>;
  const userid = typeof b.userid === "string" ? b.userid.trim() : "";
  const headers = asStringRecord(b.headers);

  if (!userid) return NextResponse.json({ ok: false, error: "缺少 userid" }, { status: 400 });
  if (!headers) return NextResponse.json({ ok: false, error: "headers 必须是对象（key/value 字符串）" }, { status: 400 });

  const torrent: unknown = b.torrent;
  const forum: unknown = b.forum;
  if (!isRecord(torrent)) return NextResponse.json({ ok: false, error: "缺少 torrent 参数" }, { status: 400 });
  if (!isRecord(forum)) return NextResponse.json({ ok: false, error: "缺少 forum 参数" }, { status: 400 });

  const torrentTimestamp = Number(torrent["timestamp"]);
  const torrentSgin = typeof torrent["sgin"] === "string" ? (torrent["sgin"] as string) : "";
  const torrentPageNumber = Number.isFinite(Number(torrent["pageNumber"])) ? Number(torrent["pageNumber"]) : 1;
  const torrentPageSize = Number.isFinite(Number(torrent["pageSize"])) ? Number(torrent["pageSize"]) : 100;

  const forumTimestamp = Number(forum["timestamp"]);
  const forumSgin = typeof forum["sgin"] === "string" ? (forum["sgin"] as string) : "";
  const fid = typeof forum["fid"] === "string" ? (forum["fid"] as string).trim() : "";
  const authorId = typeof forum["authorId"] === "string" ? (forum["authorId"] as string).trim() : userid;
  const forumPageCount = Number.isFinite(Number(forum["pageCount"])) ? Number(forum["pageCount"]) : 10;
  const forumPageSize = Number.isFinite(Number(forum["pageSize"])) ? Number(forum["pageSize"]) : 200;

  if (!Number.isFinite(torrentTimestamp) || torrentTimestamp <= 0) {
    return NextResponse.json({ ok: false, error: "torrent.timestamp 必须是正数" }, { status: 400 });
  }
  if (!torrentSgin) return NextResponse.json({ ok: false, error: "缺少 torrent.sgin" }, { status: 400 });

  if (!Number.isFinite(forumTimestamp) || forumTimestamp <= 0) {
    return NextResponse.json({ ok: false, error: "forum.timestamp 必须是正数" }, { status: 400 });
  }
  if (!forumSgin) return NextResponse.json({ ok: false, error: "缺少 forum.sgin" }, { status: 400 });
  if (!fid) return NextResponse.json({ ok: false, error: "缺少 forum.fid" }, { status: 400 });

  try {
    const torrents = await getUserTorrentList({
      userid,
      pageNumber: torrentPageNumber,
      pageSize: torrentPageSize,
      timestamp: torrentTimestamp,
      sgin: torrentSgin,
      headers,
    });
    const forumLinks = await searchForumTopics({
      fid,
      authorId,
      pageCount: forumPageCount,
      pageSize: forumPageSize,
      timestamp: forumTimestamp,
      sgin: forumSgin,
      headers,
    });

    return NextResponse.json({
      ok: true,
      torrents: torrents.items,
      torrentCount: torrents.items.length,
      forumLinks,
      forumLinkCount: forumLinks.length,
      debug: { userid, redactedHeaders: redactHeaders(headers) },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg, debug: { userid, redactedHeaders: redactHeaders(headers) } }, { status: 502 });
  }
}

