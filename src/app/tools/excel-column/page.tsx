"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SwapTwoPane } from "@/components/swap-two-pane";

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

type Mode = "numToCol" | "colToNum";

function convertExcelLines(input: string, mode: Mode): { text: string; invalidCount: number } {
	const lines = input.split(/\r?\n/);
	let invalidCount = 0;
	const out = lines.map((line) => {
		const raw = line.trim();
		if (!raw) return "";
		if (mode === "numToCol") {
			const n = Number(raw);
			if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
				invalidCount += 1;
				return "";
			}
			return numberToColumn(n);
		}
		const num = columnToNumber(raw);
		if (num == null) {
			invalidCount += 1;
			return "";
		}
		return String(num);
	});
	return { text: out.join("\n"), invalidCount };
}

export default function ExcelColumnToolPage() {
	const [mode, setMode] = React.useState<Mode>("numToCol");
	const [leftInput, setLeftInput] = React.useState<string>("");
	const [rightInput, setRightInput] = React.useState<string>("");

	const convertedFromLeft = React.useMemo(() => convertExcelLines(leftInput, mode), [leftInput, mode]);

	function swap() {
		setMode((m) => (m === "numToCol" ? "colToNum" : "numToCol"));
		setLeftInput(rightInput);
	}

	const leftHint =
		leftInput.trim() === ""
			? "支持多行：每行一个值。"
			: convertedFromLeft.invalidCount > 0
				? `有 ${convertedFromLeft.invalidCount} 行格式不正确，已输出为空行。`
				: "已完成转换。";
	const rightHint = rightInput.trim() ? "也支持从右侧输入，会自动反向转换。" : "也可以直接在右侧输入进行反向转换。";

	function onLeftChange(value: string) {
		setLeftInput(value);
		setRightInput(convertExcelLines(value, mode).text);
	}

	function onRightChange(value: string) {
		const inverse: Mode = mode === "numToCol" ? "colToNum" : "numToCol";
		setRightInput(value);
		setLeftInput(convertExcelLines(value, inverse).text);
	}

	React.useEffect(() => {
		// 方向切换时，按当前左侧重新计算右侧
		setRightInput(convertExcelLines(leftInput, mode).text);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode]);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Excel 列号 / 字母互转</h1>
					<p className="text-sm text-foreground/70">左右模式，支持一键互换：1 ↔ A，26 ↔ Z，27 ↔ AA（支持多行）。</p>
				</div>
				<Button variant="outline" asChild>
					<Link href="/">返回导航</Link>
				</Button>
			</div>

			<SwapTwoPane
				leftTitle={mode === "numToCol" ? "数字 → 字母" : "字母 → 数字"}
				rightTitle="结果"
				leftLabel={mode === "numToCol" ? "列号（从 1 开始）" : "列字母（A-Z，不区分大小写）"}
				rightLabel={mode === "numToCol" ? "列字母" : "列号"}
				leftPlaceholder={mode === "numToCol" ? "例如：27\n1\n26" : "例如：AA\na\nZ"}
				rightPlaceholder={mode === "numToCol" ? "例如：AA\nA\nZ" : "例如：27\n1\n26"}
				leftValue={leftInput}
				rightValue={rightInput}
				onLeftValueChange={onLeftChange}
				onRightValueChange={onRightChange}
				onSwap={swap}
				leftHint={leftHint}
				rightHint={rightHint}
			/>
		</div>
	);
}

