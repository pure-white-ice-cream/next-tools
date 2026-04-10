"use client";

import * as React from "react";
import Link from "next/link";
import * as OpenCC from "opencc-js";

import { SwapTwoPane } from "@/components/swap-two-pane";
import { Button } from "@/components/ui/button";

type Mode = "s2t" | "t2s";

function convertText(input: string, mode: Mode): string {
	if (!input) return "";
	const converter = mode === "s2t" ? OpenCC.Converter({ from: "cn", to: "tw" }) : OpenCC.Converter({ from: "tw", to: "cn" });
	return converter(input);
}

export default function ZhConvertToolPage() {
	const [mode, setMode] = React.useState<Mode>("s2t");
	const [leftInput, setLeftInput] = React.useState<string>("");
	const [rightInput, setRightInput] = React.useState<string>("");

	function swap() {
		setMode((m) => (m === "s2t" ? "t2s" : "s2t"));
		setLeftInput(rightInput);
	}

	const leftHint = leftInput.trim() ? "已转换（保留换行与标点）。" : "左右都可以输入，另一侧会自动输出结果。";
	const rightHint = rightInput.trim() ? "也支持从右侧输入，会自动反向转换。" : "也可以直接在右侧输入进行反向转换。";

	function onLeftChange(value: string) {
		setLeftInput(value);
		setRightInput(convertText(value, mode));
	}

	function onRightChange(value: string) {
		const inverse: Mode = mode === "s2t" ? "t2s" : "s2t";
		setRightInput(value);
		setLeftInput(convertText(value, inverse));
	}

	React.useEffect(() => {
		// 方向切换时，按当前左侧重新计算右侧
		setRightInput(convertText(leftInput, mode));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode]);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">简繁体转换</h1>
					<p className="text-sm text-foreground/70">左右模式，支持一键互换（简 → 繁 / 繁 → 简）。</p>
				</div>
				<Button variant="outline" asChild>
					<Link href="/">返回导航</Link>
				</Button>
			</div>

			<SwapTwoPane
				leftTitle={mode === "s2t" ? "简体" : "繁體"}
				rightTitle={mode === "s2t" ? "繁體" : "简体"}
				leftLabel={mode === "s2t" ? "输入（简体）" : "输入（繁體）"}
				rightLabel={mode === "s2t" ? "输出（繁體）" : "输出（简体）"}
				leftPlaceholder={mode === "s2t" ? "在此输入简体中文…" : "在此輸入繁體中文…"}
				rightPlaceholder={mode === "s2t" ? "这里会输出繁體…" : "这里会输出简体…"}
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

