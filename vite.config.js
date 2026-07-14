import { defineConfig } from "vite";

const renderHost = process.env.RENDER_EXTERNAL_HOSTNAME;
const renderUrlHost = process.env.RENDER_EXTERNAL_URL ? new URL(process.env.RENDER_EXTERNAL_URL).hostname : "";
const additionalHosts = (process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS || "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);
const allowedHosts = [
  "erp.alliedsupplies.net",
  "alliedserpsystem.onrender.com",
  ".onrender.com",
  "onrender.com",
  renderHost,
  renderUrlHost,
  ...additionalHosts,
].filter(Boolean);
const port = Number(process.env.PORT) || 4173;

export default defineConfig({
  root: "outputs",
  server: {
    host: "0.0.0.0",
    port,
    strictPort: true,
    allowedHosts,
  },
  preview: {
    host: "0.0.0.0",
    port,
    strictPort: true,
    allowedHosts,
  },
});
