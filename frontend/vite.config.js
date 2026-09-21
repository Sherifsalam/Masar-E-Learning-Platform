import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The API runs on :5000 (see masar-backend/.env). Proxying /api and /uploads
// keeps the browser on a single origin during development, so no CORS
// preflight and no absolute URLs baked into the components.
const API_TARGET = process.env.VITE_API_PROXY || "http://localhost:5000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true },
      "/uploads": { target: API_TARGET, changeOrigin: true },
    },
  },
});
