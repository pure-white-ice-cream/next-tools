"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const { theme, setTheme, systemTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	const resolvedTheme = theme === "system" ? systemTheme : theme;

	return (
		<Button
			variant="ghost"
			size="icon"
			aria-label="切换深色模式"
			onClick={() => {
				const next = (resolvedTheme ?? "light") === "dark" ? "light" : "dark";
				setTheme(next);
			}}
		>
			{mounted && resolvedTheme === "dark" ? <Sun /> : <Moon />}
		</Button>
	);
}

