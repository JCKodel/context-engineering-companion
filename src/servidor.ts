import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { criarRotasProfissionais } from "./profissionais/profissionais.http.ts";
import { criarRepositorioProfissionais } from "./profissionais/profissionais.repositorio.ts";

export const app = new Hono();

app.get("/saude", (c) => c.json({ status: "ok" }));

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const banco = new DatabaseSync("agendavila.db");
  const repositorioProfissionais = criarRepositorioProfissionais(banco);
  app.route("/", criarRotasProfissionais(repositorioProfissionais));
  serve({ fetch: app.fetch, port: 3000 });
}
