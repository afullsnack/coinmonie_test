import { Download, Share, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";

const DISMISS_KEY = "coinmonie:install-prompt-dismissed-at";
const RESHOW_AFTER_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
	if (typeof window === "undefined") return false;
	return (
		window.matchMedia?.("(display-mode: standalone)").matches ||
		(window.navigator as { standalone?: boolean }).standalone === true
	);
}

function isIos() {
	if (typeof navigator === "undefined") return false;
	return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function wasRecentlyDismissed() {
	const dismissedAt = localStorage.getItem(DISMISS_KEY);
	if (!dismissedAt) return false;
	return Date.now() - Number(dismissedAt) < RESHOW_AFTER_MS;
}

export function InstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [showIosHint, setShowIosHint] = useState(false);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (isStandalone() || wasRecentlyDismissed()) return;

		if (isIos()) {
			setVisible(true);
			return;
		}

		const handler = (event: Event) => {
			event.preventDefault();
			setDeferredPrompt(event as BeforeInstallPromptEvent);
			setVisible(true);
		};
		window.addEventListener("beforeinstallprompt", handler);
		return () => window.removeEventListener("beforeinstallprompt", handler);
	}, []);

	const dismiss = () => {
		localStorage.setItem(DISMISS_KEY, String(Date.now()));
		setVisible(false);
		setShowIosHint(false);
	};

	const install = async () => {
		if (isIos()) {
			setShowIosHint(true);
			return;
		}
		if (!deferredPrompt) return;
		await deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === "accepted") {
			setVisible(false);
		}
		setDeferredPrompt(null);
	};

	if (!visible) return null;

	return (
		<div className="sticky top-0 z-50 w-full bg-primary text-primary-foreground">
			<div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-2.5">
				<Download className="size-5 shrink-0" />
				<p className="flex-1 text-sm font-medium">Install</p>
				<Button
					size="sm"
					variant="secondary"
					className="shrink-0"
					onClick={install}
				>
					Install
				</Button>
				<button
					type="button"
					aria-label="Dismiss install prompt"
					className="shrink-0 opacity-70 hover:opacity-100"
					onClick={dismiss}
				>
					<X className="size-4" />
				</button>
			</div>
			{showIosHint && (
				<div className="mx-auto flex max-w-lg items-center gap-2 border-t border-primary-foreground/20 px-4 py-2 text-xs">
					<Share className="size-4 shrink-0" />
					<span>Tap Share, then "Add to Home Screen"</span>
					<button
						type="button"
						aria-label="Close instructions"
						className="ml-auto opacity-70 hover:opacity-100"
						onClick={dismiss}
					>
						<X className="size-3.5" />
					</button>
				</div>
			)}
		</div>
	);
}
