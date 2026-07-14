import { defineConfig } from "vite";

const renderHost = process.env.RENDER_EXTERNAL_HOSTNAME;
const allowedHosts = [".onrender.com", renderHost].filter(Boolean);
const port = Number(process.env.PORT) || 4173;

export default defineConfig({
  root: "outputs",
  server: {
    host: "0.0.0.0",
    port,
    allowedHosts,
  },
  preview: {
    host: "0.0.0.0",
    port,
    allowedHosts,
  },
});
