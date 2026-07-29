import { Hono } from "hono";
import { ErroConsultaNaoEncontrada } from "../agenda/cancelar-consulta.usecase.ts";
import type { criarCancelarConsulta } from "../agenda/cancelar-consulta.usecase.ts";
import type { criarMarcarConsulta } from "../agenda/marcar-consulta.usecase.ts";
import { criarCancelarConsultaComEncaixe } from "./cancelar-consulta-com-encaixe.usecase.ts";
import { criarEntrarListaDeEspera } from "./entrar-lista-de-espera.usecase.ts";
import type { RepositorioListaDeEspera } from "./lista-de-espera.repositorio.ts";

type CancelarConsulta = ReturnType<typeof criarCancelarConsulta>;
type MarcarConsulta = ReturnType<typeof criarMarcarConsulta>;

export function criarRotasEncaixes(
  repositorioListaDeEspera: RepositorioListaDeEspera,
  cancelarConsulta: CancelarConsulta,
  marcarConsulta: MarcarConsulta,
) {
  const cancelarConsultaComEncaixe = criarCancelarConsultaComEncaixe(
    repositorioListaDeEspera,
    cancelarConsulta,
    marcarConsulta,
  );
  const entrarListaDeEspera = criarEntrarListaDeEspera(
    repositorioListaDeEspera,
  );
  const app = new Hono();

  app.post("/consultas/:id/cancelamento", async (c) => {
    const id = Number(c.req.param("id"));
    const corpo = await c.req.json();

    try {
      const consulta = cancelarConsultaComEncaixe({
        consultaId: id,
        motivo: corpo.motivo,
      });
      return c.json(consulta, 200);
    } catch (erro) {
      if (erro instanceof ErroConsultaNaoEncontrada) {
        return c.body(null, 404);
      }
      throw erro;
    }
  });

  app.post("/lista-de-espera", async (c) => {
    const corpo = await c.req.json();

    const entrada = entrarListaDeEspera({
      profissionalId: corpo.profissionalId,
      pacienteId: corpo.pacienteId,
      data: corpo.data,
    });

    return c.json(entrada, 201);
  });

  return app;
}
