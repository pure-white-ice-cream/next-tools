"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type ConvertedType =
	| "integer"
	| "number"
	| "text_keyword"
	| "text"
	| "date"
	| "checkbox"
	| "combobox"
	| "details"
	| "formula"
	| "file"
	| "redirect"
	| "other"
	| "time"
	| "master_view";

const CONVERTED_TYPE_ORDER: ConvertedType[] = [
	"integer",
	"number",
	"text_keyword",
	"text",
	"date",
	"checkbox",
	"combobox",
	"details",
	"formula",
	"file",
	"redirect",
	"other",
	"time",
	"master_view",
];

const DEFAULT_RAW_INPUT_TYPES = `文字型
文字型
文字型
文字型
文字型`;

function normalizeInputType(s: string): string {
	return s.trim().replace(/^["']|["']$/g, "");
}

function convertOne(t: string): ConvertedType {
	const normalized = normalizeInputType(t);
	if (!normalized) return "other";

	const directMap: Record<string, ConvertedType> = {
		チェック: "checkbox",
		日付型: "date",
		数値型: "number",
		文字型: "text",
		リスト: "combobox",
		計算式: "formula",
		ボタン: "other",
		フォルダー: "file",
	};
	if (directMap[normalized]) return directMap[normalized];

	const lowered = normalized.toLowerCase();
	if (lowered.includes("int") || normalized.includes("整数")) return "integer";
	if (lowered.includes("date") || normalized.includes("日付")) return "date";
	if (lowered.includes("time") || normalized.includes("時刻") || normalized.includes("時間")) return "time";
	if (lowered.includes("file") || normalized.includes("添付") || normalized.includes("ファイル")) return "file";
	if (lowered.includes("redirect") || normalized.includes("リダイレクト")) return "redirect";
	if (lowered.includes("keyword")) return "text_keyword";
	if (lowered.includes("master") || normalized.includes("マスタ")) return "master_view";

	return "other";
}

function convertAllTypes(inputTypes: string): ConvertedType[] {
	const lines = inputTypes
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter((l) => l.length > 0);
	return lines.map(convertOne);
}

function countBy<T extends string>(items: T[]): Record<T, number> {
	const out = {} as Record<T, number>;
	for (const item of items) out[item] = (out[item] ?? 0) + 1;
	return out;
}

function getRawTypeLines(rawInputTypes: string): string[] {
	return rawInputTypes
		.split(/\r?\n/)
		.map((l) => normalizeInputType(l))
		.filter((l) => l.length > 0);
}

function buildSummaryText(converted: ConvertedType[]): string {
	const counts = countBy(converted);
	const lines: string[] = ["--- summary ---"];
	for (const k of CONVERTED_TYPE_ORDER) {
		if (counts[k]) lines.push(`${k}: ${counts[k]}`);
	}
	return lines.join("\n");
}

const SETTINGS_PART = `
  "settings": {
    "index": {
      "analysis": {
        "char_filter": {
          "normalize": { "type": "icu_normalizer", "name": "nfkc", "mode": "compose" },
          "katakana": { "type": "mapping", "mappings": [ "ぁ=>ァ", "ぃ=>ィ", "ぅ=>ゥ", "ぇ=>ェ", "ぉ=>ォ", "っ=>ッ", "ゃ=>ャ", "ゅ=>ュ", "ょ=>ョ", "が=>ガ", "ぎ=>ギ", "ぐ=>グ", "げ=>ゲ", "ご=>ゴ", "ざ=>ザ", "じ=>ジ", "ず=>ズ", "ぜ=>ゼ", "ぞ=>ゾ", "だ=>ダ", "ぢ=>ヂ", "づ=>ヅ", "で=>德", "ど=>ド", "ば=>バ", "び=>ビ", "ぶ=>ブ", "べ=>ベ", "ぼ=>ボ", "ぱ=>パ", "ぴ=>ピ", "ぷ=>プ", "ぺ=>ペ", "ぽ=>ポ", "ゔ=>ヴ", "あ=>ア", "い=>イ", "う=>ウ", "え=>エ", "お=>オ", "か=>カ", "き=>キ", "く=>ク", "け=>ケ", "こ=>コ", "さ=>サ", "し=>シ", "す=>ス", "せ=>セ", "そ=>ソ", "た=>タ", "ち=>チ", "つ=>ツ", "て=>テ", "と=>ト", "な=>ナ", "in=>ニ", "ぬ=>ヌ", "ね=>ネ", "の=>ノ", "は=>ハ", "ひ=>ヒ", "ふ=>フ", "へ=>ヘ", "ほ=>ホ", "ま=>マ", "み=>ミ", "む=>ム", "め=>メ", "も=>モ", "や=>ヤ", "ゆ=>ユ", "よ=>ヨ", "ら=>ラ", "り=>リ", "る=>ル", "れ=>レ", "ろ=>ロ", "わ=>ワ", "を=>ヲ", "ん=>ン" ] },
          "romaji": { "type": "mapping", "mappings": [ "キャ=>kya", "キュ=>kyu", "キョ=>kyo", "シャ=>sha", "シュ=>shu", "ショ=>sho", "チャ=>cha", "チュ=>chu", "チョ=>cho", "ニャ=>nya", "ニュ=>nyu", "ニョ=>nyo", "ヒャ=>hya", "ヒュ=>hyu", "ヒョ=>hyo", "ミャ=>mya", "ミュ=>myu", "ミョ=>myo", "リャ=>rya", "リュ=>ryu", "リョ=>ryo", "ファ=>fa", "フィ=>fi", "フェ=>fe", "フォ=>fo", "ギャ=>gya", "ギュ=>gyu", "ギョ=>gyo", "ジャ=>ja", "ジュ=>ju", "ジョ=>jo", "ヂャ=>ja", "ヂュ=>ju", "ヂョ=>jo", "ビャ=>bya", "ビュ=>byu", "ビョ=>byo", "ヴァ=>va", "ヴィ=>vi", "ヴ=>v", "ヴェ=>ve", "ヴォ=>vo", "ァ=>a", "ィ=>i", "ゥ=>u", "ェ=>e", "ォ=>o", "ッ=>t", "ャ=>ya", "ュ=>yu", "ョ=>yo", "ガ=>ga", "ギ=>gi", "グ=>gu", "ゲ=>ge", "ゴ=>go", "ザ=>za", "ジ=>ji", "ズ=>zu", "ゼ=>ze", "ぞ=>zo", "だ=>da", "ぢ=>ji", "づ=>zu", "で=>de", "ど=>do", "ば=>ba", "び=>bi", "ぶ=>bu", "べ=>be", "ぼ=>bo", "ぱ=>pa", "ぴ=>pi", "ぷ=>pu", "ぺ=>pe", "ぽ=>po", "ア=>a", "イ=>i", "ウ=>u", "エ=>e", "オ=>o", "カ=>ka", "キ=>ki", "ク=>ku", "ケ=>ke", "コ=>ko", "サ=>sa", "シ=>shi", "ス=>su", "セ=>se", "ソ=>so", "タ=>ta", "チ=>chi", "ツ=>tsu", "テ=>te", "ト=>to", "ナ=>na", "ニ=>ni", "ぬ=>nu", "ね=>ネ", "の=>ノ", "は=>ハ", "ひ=>ヒ", "ふ=>フ", "へ=>ヘ", "ほ=>ホ", "ま=>マ", "み=>ミ", "む=>ム", "め=>メ", "も=>モ", "や=>ヤ", "ゆ=>ユ", "よ=>ヨ", "ら=>ラ", "り=>リ", "る=>ル", "れ=>レ", "ろ=>ロ", "わ=>ワ", "を=>ヲ", "ん=>ン" ] },
          "whitespaces": { "type": "pattern_replace", "pattern": "\\\\\\\\s{2,}", "replacement": " " }
        },
        "tokenizer": {
          "sudachi_tokenizer": { "type": "sudachi_tokenizer", "split_mode": "A" },
          "ngram_ja_tokenizer": { "type": "ngram", "min_gram": 2, "max_gram": 3, "token_chars": [ "letter", "digit" ] },
          "engram": { "type": "edge_ngram", "min_gram": 1, "max_gram": 36 }
        },
        "filter": {
          "synonym": { "type": "synonym", "synonyms_path": "synonym.txt" },
          "ja_search_split": { "type": "sudachi_split", "mode": "search" },
          "ja_normalized": { "type": "sudachi_normalizedform" },
          "ja_posfilter": { "type": "sudachi_part_of_speech", "stoptags": [ "助詞", "助動詞", "補助記号,句点", "補助記号,読点" ] },
          "katakana_readingform": { "type": "sudachi_readingform", "use_romaji": false },
          "romaji_readingform": { "type": "sudachi_readingform", "use_romaji": true },
          "engram": { "type": "edge_ngram", "min_gram": 1, "max_gram": 36 },
          "maxlength": { "type": "length", "max": 36 }
        },
        "analyzer": {
          "ja_os": { "type": "custom", "char_filter": [ "html_strip", "icu_normalizer" ], "tokenizer": "sudachi_tokenizer", "filter": [ "sudachi_part_of_speech", "lowercase", "cjk_width", "sudachi_normalizedform", "stop" ] },
          "ja_synonym_os": { "type": "custom", "char_filter": [ "html_strip", "icu_normalizer" ], "tokenizer": "sudachi_tokenizer", "filter": [ "lowercase", "cjk_width", "sudachi_normalizedform", "sudachi_part_of_speech", "synonym", "stop" ] },
          "ja_ngram_os": { "type": "custom", "char_filter": [ "html_strip" ], "tokenizer": "ngram_ja_tokenizer", "filter": [ "lowercase", "cjk_width" ] },
          "keyword_analyzer_os": { "type": "custom", "char_filter": [ "normalize", "whitespaces" ], "tokenizer": "keyword", "filter": [ "lowercase", "trim", "maxlength" ] },
          "autocomplete_index_analyzer_os": { "type": "custom", "char_filter": [ "normalize", "whitespaces" ], "tokenizer": "keyword", "filter": [ "lowercase", "trim", "maxlength", "engram" ] },
          "autocomplete_search_analyzer_os": { "type": "custom", "char_filter": [ "normalize", "whitespaces" ], "tokenizer": "keyword", "filter": [ "lowercase", "trim", "maxlength" ] },
          "readingform_index_analyzer_os": { "type": "custom", "char_filter": [ "normalize", "whitespaces" ], "tokenizer": "sudachi_tokenizer", "filter": [ "lowercase", "trim", "romaji_readingform", "asciifolding", "maxlength", "engram" ] },
          "readingform_search_analyzer": { "type": "custom", "char_filter": [ "normalize", "whitespaces", "katakana", "romaji" ], "tokenizer": "sudachi_tokenizer", "filter": [ "lowercase", "trim", "maxlength", "romaji_readingform", "asciifolding" ] },
          "sudachi_analyzer": { "type": "custom", "char_filter": [ "katakana" ], "tokenizer": "sudachi_tokenizer", "filter": [ "ja_search_split", "ja_normalized", "ja_posfilter" ] },
          "sudachi_reading_analyzer": { "type": "custom", "char_filter": [ "katakana" ], "tokenizer": "sudachi_tokenizer", "filter": [ "katakana_readingform" ] },
          "romaji_analyzer": { "type": "custom", "char_filter": [ "normalize", "whitespaces" ], "tokenizer": "sudachi_tokenizer", "filter": [ "romaji_readingform", "lowercase" ] }
        }
      }
    }
  }
`;

function parseSettingsObject(): { settings: unknown } {
	// SETTINGS_PART 是 JSON 片段（以 "settings": 开头），这里用 JSON.parse 包一层外壳。
	return JSON.parse(`{${SETTINGS_PART}}`) as { settings: unknown };
}

function buildOpensearchOutputs(params: { rawInputTypes: string; indexName: string; aliasName: string }) {
	const { rawInputTypes, indexName, aliasName } = params;

	const textMapping = {
		type: "text",
		fields: {
			autocomplete: {
				type: "text",
				analyzer: "autocomplete_index_analyzer_os",
				search_analyzer: "autocomplete_search_analyzer_os",
			},
			keyword: {
				type: "keyword",
				ignore_above: 256,
			},
			readingform: {
				type: "text",
				analyzer: "readingform_index_analyzer_os",
				search_analyzer: "readingform_search_analyzer",
			},
		},
	} as const;

	const typeRules = {
		チェック: { idPrefix: "col_flg_field", mapping: { type: "boolean" } },
		日付型: { idPrefix: "col_date_field", mapping: { type: "date" } },
		文字型: { idPrefix: "col_str_field", mapping: textMapping },
		数値型: { idPrefix: "col_num_field", mapping: { type: "double" } },
		リスト: { idPrefix: "col_key_field", mapping: textMapping },
		ボタン: { idPrefix: "col_obj_field", mapping: { type: "object" } },
		計算式: { idPrefix: "col_formula_field", mapping: textMapping },
		フォルダー: { idPrefix: "col_file_field", mapping: { type: "object" } },
	} as const;

	const fixedProperties = {
		create_time: { type: "date" },
		update_time: { type: "date" },
		create_user: { type: "keyword" },
		update_user: { type: "keyword" },
	} as const;

	const dynamicProperties: Record<string, unknown> = {};
	const generatedColumns: string[] = [];
	const counters: Record<keyof typeof typeRules, number> = {
		チェック: 1,
		日付型: 1,
		文字型: 1,
		数値型: 1,
		リスト: 1,
		ボタン: 1,
		計算式: 1,
		フォルダー: 1,
	};

	const lines = getRawTypeLines(rawInputTypes);

	for (const tType of lines) {
		if (tType in typeRules) {
			const key = tType as keyof typeof typeRules;
			const rule = typeRules[key];
			const fieldId = `${rule.idPrefix}${counters[key]}`;
			dynamicProperties[fieldId] = rule.mapping;
			generatedColumns.push(fieldId);
			counters[key] += 1;
		}
	}

	const { settings } = parseSettingsObject();

	const body: Record<string, unknown> = {
		mappings: {
			properties: {
				...fixedProperties,
				...dynamicProperties,
			},
		},
		settings,
	};
	if (aliasName.trim()) {
		body.aliases = { [aliasName.trim()]: {} };
	}

	const requestText = `// Create index
PUT /${indexName.trim() || "(index_name 未填写)"}
${JSON.stringify(body, null, 2)}
`;

	const converted = convertAllTypes(rawInputTypes);
	const convertedText = converted.join("\n");
	const convertedOnlyText = convertedText + (convertedText ? "\n" : "");

	const columnsText = generatedColumns.join("\n") + (generatedColumns.length ? "\n" : "");

	return { requestText, convertedOnlyText, columnsText };
}

async function copyToClipboard(text: string) {
	await navigator.clipboard.writeText(text);
}

export default function OpenSearchMappingToolPage() {
	const [rawInputTypes, setRawInputTypes] = React.useState<string>(DEFAULT_RAW_INPUT_TYPES);
	const [indexName, setIndexName] = React.useState<string>("stand_example_lw");
	const [aliasName, setAliasName] = React.useState<string>("stand_example");

	const outputs = React.useMemo(() => {
		return buildOpensearchOutputs({ rawInputTypes, indexName, aliasName });
	}, [rawInputTypes, indexName, aliasName]);

	const rawSummary = React.useMemo(() => {
		const lines = getRawTypeLines(rawInputTypes);
		let numberCount = 0;
		let textCount = 0;
		for (const t of lines) {
			if (t === "数値型") numberCount += 1;
			if (t === "文字型") textCount += 1;
		}
		return { total: lines.length, numberCount, textCount };
	}, [rawInputTypes]);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">OpenSearch Mapping 生成器（网页版）</h1>
					<p className="text-sm text-foreground/70">粘贴字段类型列表，直接在页面生成 index 创建请求体与辅助输出。</p>
				</div>
				<Button variant="outline" asChild>
					<Link href="/">返回导航</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>输入</CardTitle>
					<CardDescription>每行一个类型（例如：リスト、ボタン、数値型…）。</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="indexName">index_name</Label>
							<Input
								id="indexName"
								placeholder="例如 stand_example_lw"
								value={indexName}
								onChange={(e) => setIndexName(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="aliasName">alias_name（可选）</Label>
							<Input
								id="aliasName"
								placeholder="例如 stand_example"
								value={aliasName}
								onChange={(e) => setAliasName(e.target.value)}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="rawInputTypes">类型列表</Label>
						<div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-foreground/80">
							<div className="flex flex-wrap gap-x-4 gap-y-1">
								<span>总数：{rawSummary.total}</span>
								<span>数値型：{rawSummary.numberCount}</span>
								<span>文本型：{rawSummary.textCount}</span>
							</div>
						</div>
						<Textarea
							id="rawInputTypes"
							value={rawInputTypes}
							onChange={(e) => setRawInputTypes(e.target.value)}
							placeholder="每行一个类型"
							className="min-h-56 font-mono"
						/>
					</div>
				</CardContent>
				<CardFooter className="justify-end gap-2">
					<Button
						variant="secondary"
						type="button"
						onClick={() => {
							setRawInputTypes("");
							setIndexName("");
							setAliasName("");
						}}
					>
						清空
					</Button>
					<Button
						type="button"
						onClick={() => {
							setRawInputTypes(DEFAULT_RAW_INPUT_TYPES);
							setIndexName("stand_example_lw");
							setAliasName("stand_example");
						}}
					>
						恢复示例
					</Button>
				</CardFooter>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>输出 1：创建 index 请求</CardTitle>
					<CardDescription>等价于原脚本写入的 `opensearch_mapping.json`（但这里直接在页面显示）。</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<Textarea readOnly value={outputs.requestText} className="min-h-64 font-mono" />
				</CardContent>
				<CardFooter className="justify-end gap-2">
					<Button type="button" variant="secondary" onClick={() => copyToClipboard(outputs.requestText)}>
						复制
					</Button>
				</CardFooter>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>输出 2：字段类型归一化</CardTitle>
					<CardDescription>只包含按行归一化后的字段类型（不包含统计）。</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<Textarea readOnly value={outputs.convertedOnlyText} className="min-h-56 font-mono" />
				</CardContent>
				<CardFooter className="justify-end gap-2">
					<Button type="button" variant="secondary" onClick={() => copyToClipboard(outputs.convertedOnlyText)}>
						复制
					</Button>
				</CardFooter>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>输出 3：生成的 col_* 字段名清单</CardTitle>
					<CardDescription>等价于原脚本写入的 `generated_columns.txt`（每行一个字段名）。</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<Textarea readOnly value={outputs.columnsText} className="min-h-40 font-mono" />
				</CardContent>
				<CardFooter className="justify-end gap-2">
					<Button type="button" variant="secondary" onClick={() => copyToClipboard(outputs.columnsText)}>
						复制
					</Button>
				</CardFooter>
			</Card>

			<Separator />

			<Card>
				<CardHeader>
					<CardTitle>说明</CardTitle>
					<CardDescription>本工具不读写文件；所有输入/输出都在浏览器内完成。</CardDescription>
				</CardHeader>
				<CardContent className="text-sm text-foreground/80 space-y-2">
					<p>动态字段生成规则与原脚本一致：按出现顺序给每种类型分别递增编号（例如 `リスト` → `col_key_field1`、`col_key_field2`）。</p>
					<p>如果 `alias_name` 为空，则输出中不会包含 `aliases`。</p>
				</CardContent>
			</Card>
		</div>
	);
}

