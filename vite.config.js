// Vite configuration file.
// Vite is the build tool / dev server used to develop and bundle this site.
//
// Vite 6 + Tailwind CSS 4 note:
//   In Tailwind v4, the Tailwind plugin is loaded directly as a Vite plugin
//   (instead of via PostCSS + a separate tailwind.config.js file). This is why
//   we import "@tailwindcss/vite" here, and why there is no longer a
//   tailwind.config.js or postcss.config.js in this project — all Tailwind
//   configuration now lives in src/index.css using CSS-first configuration
//   (the @theme directive).

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Enables React Fast Refresh + JSX support
import tailwindcss from '@tailwindcss/vite' // Enables Tailwind CSS v4 (CSS-first config)

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
