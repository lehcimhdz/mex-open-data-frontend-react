import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_PROXY_TARGET || "http://localhost:18000";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
    },
  };
});
