import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"
import { fileURLToPath } from "url"

// Create an equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  base: '',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Forward /api/* → Express backend during development
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
})