import { defineConfig, type Plugin } from "vite";
const pantryFallback: Plugin = {
  name: "local-pantry-fallback",
  configureServer(server) {
    server.middlewares.use("/api/pantry", (_req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.end('{"available":false}');
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use("/api/pantry", (_req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.end('{"available":false}');
    });
  },
};
export default defineConfig({ plugins: [pantryFallback] });
