import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/bamtibam/",      // ★ GitHub Pages 경로
  build: {
    outDir: "docs",        // ★ GitHub Pages에 맞춰 docs로 빌드
  },
});
