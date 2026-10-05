import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
// import { cloudflare } from "@cloudflare/vite-plugin";
import { nitro } from 'nitro/vite'
// import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro({
      rollupConfig: { external: [/^@sentry\//] },
      // serverDir: './src/server',
      // experimental: { tasks: true },
      // tasks: {
      //   'db:migration:sqlite': {
      //     handler: fileURLToPath(
      //       new URL('./src/server/tasks/db-migration.ts', import.meta.url),
      //     ),
      //   },
      // },
      // Auto generated cloudflare cron trigger
			// scheduledTasks: {},
      hooks: {
        async compiled() {
          // TODO: Update this for prod
          if (process.env.NODE_ENV !== 'production') return
          execSync('npx drizzle-kit generate', { stdio: 'inherit' })
          execSync('npx drizzle-kit push', { stdio: 'inherit' })
          console.log(`[drizzle] Generation ran`)
        },
      },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
    // cloudflare({
    //   viteEnvironment: {
    //     name: "ssr"
    //   }
    // }),
  ],
})

export default config
