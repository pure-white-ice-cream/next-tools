"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type TorrentItem = {
	id: string | number;
	createdDate?: string;
	name?: string;
	smallDescr?: string;
};

type RunOk = {
	ok: true;
	torrents: TorrentItem[];
	torrentCount: number;
	forumLinks: string[];
	forumLinkCount: number;
	debug?: unknown;
};

type RunErr = {
	ok: false;
	error: string;
	debug?: unknown;
};

function safeJsonParse(s: string): { ok: true; value: unknown } | { ok: false; error: string } {
	try {
		return { ok: true, value: JSON.parse(s) as unknown };
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : String(e) };
	}
}

const DEFAULT_HEADERS_JSON = `{
  "authority": "api.m-team.io",
  "accept": "application/json, text/plain, */*",
  "authorization": "手动填写",
  "content-type": "application/json",
  "did": "手动填写",
  "origin": "https://kp.m-team.cc",
  "referer": "https://kp.m-team.cc/",
  "ts": "手动填写",
  "user-agent": "手动填写",
  "version": "手动填写",
  "visitorid": "手动填写",
  "webversion": "手动填写"
}`;

export default function MTeamHelperToolPage() {
	const [userid, setUserid] = React.useState<string>("");

	const [torrentTimestamp, setTorrentTimestamp] = React.useState<string>("");
	const [torrentSgin, setTorrentSgin] = React.useState<string>("");
	const [torrentPageNumber, setTorrentPageNumber] = React.useState<string>("1");
	const [torrentPageSize, setTorrentPageSize] = React.useState<string>("100");

	const [fid, setFid] = React.useState<string>("56");
	const [forumAuthorId, setForumAuthorId] = React.useState<string>("");
	const [forumTimestamp, setForumTimestamp] = React.useState<string>("");
	const [forumSgin, setForumSgin] = React.useState<string>("");
	const [forumPageCount, setForumPageCount] = React.useState<string>("10");
	const [forumPageSize, setForumPageSize] = React.useState<string>("200");

	const [headersJson, setHeadersJson] = React.useState<string>(DEFAULT_HEADERS_JSON);

	const [loading, setLoading] = React.useState(false);
	const [result, setResult] = React.useState<RunOk | null>(null);
	const [error, setError] = React.useState<RunErr | null>(null);

	const headersParse = React.useMemo(() => safeJsonParse(headersJson), [headersJson]);
	const headersObj = headersParse.ok ? headersParse.value : null;
	const headersInvalid = !headersParse.ok || !headersObj || typeof headersObj !== "object" || Array.isArray(headersObj);

	async function run() {
		setLoading(true);
		setResult(null);
		setError(null);
		try {
			if (headersInvalid) {
				setError({ ok: false, error: headersParse.ok ? "headers JSON 必须是对象" : "headers JSON 解析失败：" + headersParse.error });
				return;
			}
			const payload = {
				userid: userid.trim(),
				headers: headersObj,
				torrent: {
					pageNumber: Number(torrentPageNumber) || 1,
					pageSize: Number(torrentPageSize) || 100,
					timestamp: Number(torrentTimestamp),
					sgin: torrentSgin.trim(),
				},
				forum: {
					fid: fid.trim(),
					authorId: (forumAuthorId || userid).trim(),
					pageCount: Number(forumPageCount) || 10,
					pageSize: Number(forumPageSize) || 200,
					timestamp: Number(forumTimestamp),
					sgin: forumSgin.trim(),
				},
			};

			const res = await fetch("/api/mteam/run", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(payload),
			});
			const json = (await res.json()) as RunOk | RunErr;
			if (!res.ok || !json.ok) {
				setError(json.ok ? { ok: false, error: "请求失败" } : json);
				return;
			}
			setResult(json);
		} catch (e) {
			setError({ ok: false, error: e instanceof Error ? e.message : String(e) });
		} finally {
			setLoading(false);
		}
	}

	const canRun = !loading && userid.trim() && !headersInvalid && torrentTimestamp.trim() && torrentSgin.trim() && forumTimestamp.trim() && forumSgin.trim() && fid.trim();

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">M-Team：上传种子 & 论坛作者帖查询（手动填参）</h1>
					<p className="text-sm text-foreground/70">
						公开工具页不内置任何敏感信息。你需要手动填写 `headers`、`_timestamp`、`_sgin` 等参数。本工具通过服务端转发请求，避免浏览器跨域。
					</p>
				</div>
				<Button variant="outline" asChild>
					<Link href="/">返回导航</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>输入</CardTitle>
					<CardDescription>把浏览器里抓到的请求参数粘贴进来（尤其是 `authorization`、`did`、`ts`、`_timestamp`、`_sgin`）。</CardDescription>
				</CardHeader>
				<CardContent className="space-y-5">
					<div className="space-y-2">
						<Label htmlFor="userid">userid</Label>
						<Input id="userid" placeholder="例如 328357" value={userid} onChange={(e) => setUserid(e.target.value)} />
					</div>

					<Separator />

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="torrentTimestamp">getUserTorrentList：_timestamp</Label>
							<Input
								id="torrentTimestamp"
								inputMode="numeric"
								placeholder="例如 1756456872837"
								value={torrentTimestamp}
								onChange={(e) => setTorrentTimestamp(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="torrentSgin">getUserTorrentList：_sgin</Label>
							<Input
								id="torrentSgin"
								placeholder='例如 "InIABX..."'
								value={torrentSgin}
								onChange={(e) => setTorrentSgin(e.target.value)}
							/>
						</div>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="torrentPageNumber">getUserTorrentList：pageNumber</Label>
							<Input id="torrentPageNumber" inputMode="numeric" value={torrentPageNumber} onChange={(e) => setTorrentPageNumber(e.target.value)} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="torrentPageSize">getUserTorrentList：pageSize</Label>
							<Input id="torrentPageSize" inputMode="numeric" value={torrentPageSize} onChange={(e) => setTorrentPageSize(e.target.value)} />
						</div>
					</div>

					<Separator />

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="fid">forum/topic/search：fid</Label>
							<Input id="fid" placeholder="例如 56" value={fid} onChange={(e) => setFid(e.target.value)} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="forumAuthorId">forum/topic/search：authorId（可选，默认=userid）</Label>
							<Input
								id="forumAuthorId"
								placeholder="留空则使用 userid"
								value={forumAuthorId}
								onChange={(e) => setForumAuthorId(e.target.value)}
							/>
						</div>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="forumTimestamp">forum/topic/search：_timestamp</Label>
							<Input
								id="forumTimestamp"
								inputMode="numeric"
								placeholder="例如 1756458353073"
								value={forumTimestamp}
								onChange={(e) => setForumTimestamp(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="forumSgin">forum/topic/search：_sgin</Label>
							<Input id="forumSgin" placeholder='例如 "bWPvq..."' value={forumSgin} onChange={(e) => setForumSgin(e.target.value)} />
						</div>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="forumPageCount">forum/topic/search：pageCount</Label>
							<Input id="forumPageCount" inputMode="numeric" value={forumPageCount} onChange={(e) => setForumPageCount(e.target.value)} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="forumPageSize">forum/topic/search：pageSize</Label>
							<Input id="forumPageSize" inputMode="numeric" value={forumPageSize} onChange={(e) => setForumPageSize(e.target.value)} />
						</div>
					</div>

					<Separator />

					<div className="space-y-2">
						<Label htmlFor="headersJson">headers（JSON，对象）</Label>
						<Textarea
							id="headersJson"
							value={headersJson}
							onChange={(e) => setHeadersJson(e.target.value)}
							className="min-h-56 font-mono"
						/>
						{headersParse.ok ? null : <p className="text-sm text-red-600 dark:text-red-400">JSON 解析失败：{headersParse.error}</p>}
					</div>
				</CardContent>
				<CardFooter className="flex flex-wrap justify-end gap-2">
					<Button
						type="button"
						variant="secondary"
						onClick={() => {
							setUserid("");
							setTorrentTimestamp("");
							setTorrentSgin("");
							setForumTimestamp("");
							setForumSgin("");
							setForumAuthorId("");
							setResult(null);
							setError(null);
						}}
					>
						清空关键字段
					</Button>
					<Button type="button" disabled={!canRun} onClick={run}>
						{loading ? "请求中..." : "运行"}
					</Button>
				</CardFooter>
			</Card>

			{error ? (
				<Card>
					<CardHeader>
						<CardTitle className="text-red-700 dark:text-red-300">错误</CardTitle>
						<CardDescription>如果上游返回 401/403，多半是 `authorization/did/ts/_timestamp/_sgin` 不匹配或已过期。</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Textarea readOnly value={JSON.stringify(error, null, 2)} className="min-h-40 font-mono" />
					</CardContent>
				</Card>
			) : null}

			{result ? (
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>上传种子（UPLOADED）</CardTitle>
							<CardDescription>总计：{result.torrentCount} 条（仅当前 pageSize/pageNumber 返回的条数）。</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<Textarea
								readOnly
								value={result.torrents.map((t) => t.name ?? String(t.id)).join("\n")}
								className="min-h-56 font-mono"
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>论坛主题链接（按作者过滤）</CardTitle>
							<CardDescription>命中：{result.forumLinkCount} 条。</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<Textarea readOnly value={result.forumLinks.join("\n")} className="min-h-40 font-mono" />
						</CardContent>
						<CardFooter className="justify-end gap-2">
							<Button
								type="button"
								variant="secondary"
								onClick={async () => {
									await navigator.clipboard.writeText(result.forumLinks.join("\n"));
								}}
							>
								复制链接
							</Button>
						</CardFooter>
					</Card>
				</div>
			) : null}
		</div>
	);
}

