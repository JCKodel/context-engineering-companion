import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { criarRotasAgenda } from "./agenda/agenda.http.ts";
import { criarCancelarConsulta } from "./agenda/cancelar-consulta.usecase.ts";
import { criarRepositorioConsultas } from "./agenda/consultas.repositorio.ts";
import { criarMarcarConsulta } from "./agenda/marcar-consulta.usecase.ts";
import { criarRotasEncaixes } from "./encaixes/encaixes.http.ts";
import { criarRepositorioListaDeEspera } from "./encaixes/lista-de-espera.repositorio.ts";
import { criarRotasProfissionais } from "./profissionais/profissionais.http.ts";
import { criarRepositorioProfissionais } from "./profissionais/profissionais.repositorio.ts";

export const app = new Hono();

app.get("/saude", (c) => c.json({ status: "ok" }));

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const banco = new DatabaseSync("agendavila.db");
  const repositorioProfissionais = criarRepositorioProfissionais(banco);
  const repositorioConsultas = criarRepositorioConsultas(banco);
  const repositorioListaDeEspera = criarRepositorioListaDeEspera(banco);
  app.route("/", criarRotasProfissionais(repositorioProfissionais));
  app.route("/", criarRotasAgenda(repositorioConsultas, repositorioProfissionais));
  app.route(
    "/",
    criarRotasEncaixes(
      repositorioListaDeEspera,
      criarCancelarConsulta(repositorioConsultas),
      criarMarcarConsulta(repositorioConsultas, repositorioProfissionais),
    ),
  );
  serve({ fetch: app.fetch, port: 3000 });
}
