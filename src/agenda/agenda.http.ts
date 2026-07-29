import { Hono } from "hono";
import type { ConsultarGrade } from "../profissionais/consultar-grade.usecase.ts";
import type { RepositorioConsultas } from "./consultas.repositorio.ts";
import { criarGerarRelatorioMensal } from "./gerar-relatorio-mensal.usecase.ts";
import {
  ErroMarcarConsulta,
  criarMarcarConsulta,
} from "./marcar-consulta.usecase.ts";

export function criarRotasAgenda(
  repositorioConsultas: RepositorioConsultas,
  consultarGrade: ConsultarGrade,
) {
  const marcarConsulta = criarMarcarConsulta(
    repositorioConsultas,
    consultarGrade,
  );
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

  app.get("/relatorios/mensal", (c) => {
    const mes = c.req.query("mes") ?? "";
    return c.json(gerarRelatorioMensal(mes));
  });

  return app;
}
