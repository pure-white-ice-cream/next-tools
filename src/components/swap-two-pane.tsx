"use client";

import * as React from "react";
import { ArrowLeftRight, Copy, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SwapTwoPaneProps = {
	leftTitle: string;
	rightTitle: string;
	leftLabel: string;
	rightLabel: string;
	leftPlaceholder?: string;
	rightPlaceholder?: string;
	leftValue: string;
	rightValue: string;
	onLeftValueChange: (value: string) => void;
	onRightValueChange: (value: string) => void;
	onSwap: () => void;
	leftHint?: React.ReactNode;
	rightHint?: React.ReactNode;
};

async function copyToClipboard(text: string) {
	await navigator.clipboard.writeText(text);
}

export function SwapTwoPane(props: SwapTwoPaneProps) {
	const {
		leftTitle,
		rightTitle,
		leftLabel,
		rightLabel,
		leftPlaceholder,
		rightPlaceholder,
		leftValue,
		rightValue,
		onLeftValueChange,
		onRightValueChange,
		onSwap,
		leftHint,
		rightHint,
	} = props;

	const [copied, setCopied] = React.useState<"left" | "right" | null>(null);

	async function onCopy(side: "left" | "right") {
		const text = side === "left" ? leftValue : rightValue;
		await copyToClipboard(text);
		setCopied(side);
		window.setTimeout(() => setCopied((v) => (v === side ? null : v)), 900);
	}

	return (
		<div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
			<Card className="h-full">
				<CardHeader>
					<CardTitle>{leftTitle}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<Label htmlFor="swapTwoPaneLeft">{leftLabel}</Label>
					<Textarea
						id="swapTwoPaneLeft"
						value={leftValue}
						onChange={(e) => onLeftValueChange(e.target.value)}
						placeholder={leftPlaceholder}
						className="min-h-56 font-mono"
					/>
					{leftHint ? <div className="text-sm text-foreground/70">{leftHint}</div> : null}
				</CardContent>
				<CardFooter className="flex flex-wrap justify-end gap-2">
					<Button type="button" variant="secondary" onClick={() => onLeftValueChange("")}>
						<Trash2 />
						清空
					</Button>
					<Button type="button" variant="secondary" onClick={() => onCopy("left")} disabled={!leftValue.trim()}>
						<Copy />
						{copied === "left" ? "已复制" : "复制"}
					</Button>
				</CardFooter>
			</Card>

			<div className="flex items-center justify-center md:px-1">
				<Button type="button" variant="outline" size="icon" onClick={onSwap} aria-label="左右互换">
					<ArrowLeftRight />
				</Button>
			</div>

			<Card className="h-full">
				<CardHeader>
					<CardTitle>{rightTitle}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<Label htmlFor="swapTwoPaneRight">{rightLabel}</Label>
					<Textarea
						id="swapTwoPaneRight"
						value={rightValue}
						onChange={(e) => onRightValueChange(e.target.value)}
						placeholder={rightPlaceholder}
						className="min-h-56 font-mono"
					/>
					{rightHint ? <div className="text-sm text-foreground/70">{rightHint}</div> : null}
				</CardContent>
				<CardFooter className="flex flex-wrap justify-end gap-2">
					<Button type="button" variant="secondary" onClick={() => onRightValueChange("")}>
						<Trash2 />
						清空
					</Button>
					<Button type="button" variant="secondary" onClick={() => onCopy("right")} disabled={!rightValue.trim()}>
						<Copy />
						{copied === "right" ? "已复制" : "复制"}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

