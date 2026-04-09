import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Next Tools",
	description: "工具集合网站：入口导航 + 小工具页面",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="zh-CN" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider>
					<div className="min-h-screen">
						<header className="sticky top-0 z-50 border-b border-black/10 bg-background/80 backdrop-blur dark:border-white/15">
							<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
								<Link href="/" className="font-semibold tracking-tight">
									Next Tools
								</Link>
								<div className="flex items-center gap-2">
									<ThemeToggle />
								</div>
							</div>
						</header>
						<main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
					</div>
				</ThemeProvider>
			</body>
		</html>
	);
}
