import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const tools = [
	{
		title: "Excel 列号 / 字母互转",
		description: "在 A、Z、AA… 与 1、26、27… 之间互相转换。",
		href: "/tools/excel-column",
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
