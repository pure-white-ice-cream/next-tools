"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function numberToColumn(value: number): string {
	if (!Number.isFinite(value) || value <= 0 || !Number.isInteger(value)) return "";
	let n = value;
	let result = "";
	while (n > 0) {
		n -= 1;
		result = String.fromCharCode(65 + (n % 26)) + result;
		n = Math.floor(n / 26);
	}
	return result;
}

function columnToNumber(value: string): number | null {
	const s = value.trim().toUpperCase();
	if (!s) return null;
	if (!/^[A-Z]+$/.test(s)) return null;
	let result = 0;
	for (const ch of s) {
		result = result * 26 + (ch.charCodeAt(0) - 64);
	}
	return result;
}

export default function ExcelColumnToolPage() {
	const [numInput, setNumInput] = React.useState<string>("");
	const [colInput, setColInput] = React.useState<string>("");

	const num = numInput.trim() === "" ? null : Number(numInput);
	const numResult = num == null || Number.isNaN(num) ? "" : numberToColumn(num);
	const numInvalid =
		num == null || Number.isNaN(num) || !Number.isFinite(num) || !Number.isInteger(num) || num <= 0;
	const numError =
		numInput.trim() === ""
			? ""
			: numInvalid
				? "请输入正整数（例如 1、26、27）。"
				: "";

	const colResult = colInput.trim() === "" ? null : columnToNumber(colInput);
	const colError =
		colInput.trim() === ""
			? ""
			: colResult == null
				? "请输入由 A-Z 组成的字母（例如 A、Z、AA）。"
				: "";

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Excel 列号 / 字母互转</h1>
					<p className="text-sm text-foreground/70">支持 1 ↔ A，26 ↔ Z，27 ↔ AA。</p>
				</div>
				<Button variant="outline" asChild>
					<Link href="/">返回导航</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>数字 → 字母</CardTitle>
					<CardDescription>输入列号（从 1 开始）。</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="space-y-2">
						<Label htmlFor="num">列号</Label>
						<Input
							id="num"
							inputMode="numeric"
							placeholder="例如 27"
							value={numInput}
							onChange={(e) => setNumInput(e.target.value)}
						/>
						{numError ? <p className="text-sm text-red-600 dark:text-red-400">{numError}</p> : null}
					</div>

					<Separator />

					<div className="space-y-2">
						<Label htmlFor="numResult">结果</Label>
						<Input id="numResult" readOnly value={numResult} placeholder="例如 AA" />
					</div>
				</CardContent>
				<CardFooter className="justify-end">
					<Button variant="secondary" onClick={() => setNumInput("")} type="button">
						清空
					</Button>
				</CardFooter>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>字母 → 数字</CardTitle>
					<CardDescription>输入列字母（不区分大小写）。</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="space-y-2">
						<Label htmlFor="col">列字母</Label>
						<Input id="col" placeholder="例如 AA" value={colInput} onChange={(e) => setColInput(e.target.value)} />
						{colError ? <p className="text-sm text-red-600 dark:text-red-400">{colError}</p> : null}
					</div>

					<Separator />

					<div className="space-y-2">
						<Label htmlFor="colResult">结果</Label>
						<Input id="colResult" readOnly value={colResult ?? ""} placeholder="例如 27" />
					</div>
				</CardContent>
				<CardFooter className="justify-end">
					<Button variant="secondary" onClick={() => setColInput("")} type="button">
						清空
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

