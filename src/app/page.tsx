import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const tools = [
	{
		title: "Excel 列号 / 字母互转",
		description: "在 A、Z、AA… 与 1、26、27… 之间互相转换。",
		href: "/tools/excel-column",
	},
	{
		title: "OpenSearch Mapping 生成器",
		description: "根据字段类型列表生成 OpenSearch index mappings/settings/aliases，并输出 col_* 字段清单。",
		href: "/tools/opensearch-mapping",
	},
] as const;

export default function HomePage() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h1 className="text-2xl font-semibold tracking-tight">工具集合</h1>
				<p className="text-sm text-foreground/70">入口导航面板。选择一个工具开始使用。</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				{tools.map((tool) => (
					<Card key={tool.href}>
						<CardHeader>
							<CardTitle>{tool.title}</CardTitle>
							<CardDescription>{tool.description}</CardDescription>
						</CardHeader>
						<CardContent />
						<CardFooter className="justify-end">
							<Button asChild>
								<Link href={tool.href}>打开</Link>
							</Button>
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
}
