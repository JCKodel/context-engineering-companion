import { Hono } from "hono";
import type { RepositorioProfissionais } from "../profissionais/profissionais.repositorio.ts";
import {
  ErroConsultaNaoEncontrada,
  criarCancelarConsulta,
} from "./cancelar-consulta.usecase.ts";
import type { RepositorioConsultas } from "./consultas.repositorio.ts";
import { criarGerarRelatorioMensal } from "./gerar-relatorio-mensal.usecase.ts";
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
  const cancelarConsulta = criarCancelarConsulta(repositorioConsultas);
  const gerarRelatorioMensal = criarGerarRelatorioMensal(repositorioConsultas);
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

  app.post("/consultas/:id/cancelamento", async (c) => {
    const id = Number(c.req.param("id"));
    const corpo = await c.req.json();

    try {
      const consulta = cancelarConsulta({ consultaId: id, motivo: corpo.motivo });
      return c.json(consulta, 200);
    } catch (erro) {
      if (erro instanceof ErroConsultaNaoEncontrada) {
        return c.body(null, 404);
      }
      throw erro;
    }
  });

  app.get("/relatorios/mensal", (c) => {
    const mes = c.req.query("mes") ?? "";
    return c.json(gerarRelatorioMensal(mes));
  });

  return app;
}
