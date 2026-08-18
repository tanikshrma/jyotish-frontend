import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "@leadconnector/vibe-tagger";
import { devApiPlugin } from "./vite-dev-api";

// https://vitejs.dev/config/
// Trigger restart
export default defineConfig(({ mode }) => {
  // Expose non-VITE_ vars (RAZORPAY_KEY_SECRET etc.) to the dev API handlers.
  // The "" prefix loads every key; these stay in the Node process and are never
  // bundled into the client.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    server: {
      host: "::",
      port: 8080,
      allowedHosts: [".modal.host"],
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      devApiPlugin(),
      mode === "development" && componentTagger({ tailwindConfig: true }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
