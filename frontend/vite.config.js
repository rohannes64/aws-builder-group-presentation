import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the built app works when hosted from an S3 website
// endpoint or any subpath, without needing a custom domain configured.
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    port: 5173,
  },
});
