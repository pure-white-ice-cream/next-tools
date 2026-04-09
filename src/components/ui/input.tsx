import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			data-slot="input"
			type={type}
			className={cn(
				"flex h-9 w-full rounded-md border border-black/10 bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };

