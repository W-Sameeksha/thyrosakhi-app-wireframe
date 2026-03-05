import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/analyze-voice": "http://127.0.0.1:5000",
      "/analyze-image": "http://127.0.0.1:5000",
      "/analyze-neck": "http://127.0.0.1:5000",
      "/analyze-neck-video": "http://127.0.0.1:5000",
      "/calculate-risk": "http://127.0.0.1:5000",
      "/nearby-clinics": "http://127.0.0.1:5000",
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
