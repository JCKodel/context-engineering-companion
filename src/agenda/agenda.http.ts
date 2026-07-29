import { Hono } from "hono";
import type { RepositorioProfissionais } from "../profissionais/profissionais.repositorio.ts";
import type { RepositorioConsultas } from "./consultas.repositorio.ts";
import {
  ErroMarcarConsulta,
  criarMarcarConsulta,
} from "./marcar-consulta.usecase.ts";

export function criarRotasAgenda(
  repositorioConsultas: RepositorioConsultas,
  repositorioProfissionais: RepositorioProfissionais,
) {
  const marcarConsulta = criarMarcarConsulta(
    repositorioConsultas,
    repositorioProfissionais,
  );
  const app = new Hono();

  app.post("/consultas", async (c) => {
    const corpo = await c.req.json();

    try {
      const consulta = marcarConsulta(corpo);
      return c.json(consulta, 201);
    } catch (erro) {
      if (erro instanceof ErroMarcarConsulta) {
        return c.json({ erro: erro.message }, 422);
      }
      throw erro;
    }
  });

  return app;
}
