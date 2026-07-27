import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}


export const defaultInputStyle = `outline-0 focus-visible:ring-0 p-2 focus:bg-transparent dark:bg-transparent h-auto`
