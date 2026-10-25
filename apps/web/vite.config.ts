import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Resolve environment variables from the monorepo root as well as apps/web
  const rootEnvDir = path.resolve(__dirname, "../../");
  const env = {
    ...loadEnv(mode, rootEnvDir, ""),
    ...loadEnv(mode, process.cwd(), ""),
  };

  // Frontend URL resolution from env (supports VITE_FRONTEND_URL, FRONTEND_URL, or CORS_ORIGIN)
  const frontendUrl =
    env.VITE_FRONTEND_URL ||
    env.FRONTEND_URL ||
    env.CORS_ORIGIN ||
    "http://localhost:5173";

  let serverPort = Number(env.VITE_PORT || env.PORT) || 5173;
  let serverHost: string | boolean = env.VITE_HOST || true;

  try {
    const parsedFrontend = new URL(frontendUrl);
    if (parsedFrontend.port && !env.VITE_PORT) {
      serverPort = Number(parsedFrontend.port);
    }
    if (
      parsedFrontend.hostname &&
      parsedFrontend.hostname !== "localhost" &&
      !env.VITE_HOST
    ) {
      serverHost = parsedFrontend.hostname;
    }
  } catch {
    // Fall back to defaults if URL parsing fails
  }

  // Backend API URL for Vite dev proxy
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET ||
    env.VITE_API_URL ||
    env.API_URL ||
    "http://localhost:5000";

  return {
    envDir: rootEnvDir,
    plugins: [react(), tailwindcss()],
    define: {
      "import.meta.env.VITE_FRONTEND_URL": JSON.stringify(frontendUrl),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@features": path.resolve(__dirname, "./src/features"),
        "@shared": path.resolve(__dirname, "./src/shared"),
        "@unimarket/shared": path.resolve(
          __dirname,
          "../../packages/shared/src/index.ts",
        ),
      },
    },
    server: {
      host: serverHost,
      port: serverPort,
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: serverHost,
      port: serverPort,
    },
  };
});
