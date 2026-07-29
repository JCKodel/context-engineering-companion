import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

export const app = new Hono();

app.get("/saude", (c) => c.json({ status: "ok" }));

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  serve({ fetch: app.fetch, port: 3000 });
}
