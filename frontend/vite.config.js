import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  build: {
    outDir: "../backend/public", // outputs directly to backend/public
    emptyOutDir: true,
  },
  plugins: [tailwindcss()],
});
