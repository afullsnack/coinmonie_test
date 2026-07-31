import { fileURLToPath } from "node:url";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import neon from "./neon-vite-plugin.ts";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
		nitro({
			rollupConfig: { external: [/^@sentry\//] },
			experimental: { tasks: true },
			tasks: {
				'transactions:reconcile': {
					handler: fileURLToPath(new URL('./src/tasks/reconcile-transactions.ts', import.meta.url)),
				},
			},
			// Auto-generates a Cloudflare Cron Trigger at build time.
			scheduledTasks: {
				'*/15 * * * *': 'transactions:reconcile',
			},
		}),
		neon,
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		babel({ presets: [reactCompilerPreset()] }),
	],
});

export default config;
