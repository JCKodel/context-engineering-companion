import { Hono } from "hono";
import {
  ErroCadastroProfissional,
  criarCadastrarProfissional,
} from "./cadastrar-profissional.usecase.ts";
import type { RepositorioProfissionais } from "./profissionais.repositorio.ts";

export function criarRotasProfissionais(repositorio: RepositorioProfissionais) {
  const cadastrarProfissional = criarCadastrarProfissional(repositorio);
  const app = new Hono();

  app.post("/profissionais", async (c) => {
    const corpo = await c.req.json();

    try {
      const profissional = cadastrarProfissional(corpo);
      return c.json(profissional, 201);
    } catch (erro) {
      if (erro instanceof ErroCadastroProfissional) {
        return c.json({ erro: erro.message }, 422);
      }
      throw erro;
    }
  });

  return app;
}
