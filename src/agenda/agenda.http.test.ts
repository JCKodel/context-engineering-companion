import { DatabaseSync } from "node:sqlite";
import { expect, test } from "vitest";
import { criarRepositorioProfissionais } from "../profissionais/profissionais.repositorio.ts";
import { criarRotasAgenda } from "./agenda.http.ts";
import type { Consulta } from "./consultas.repositorio.ts";
import { criarRepositorioConsultas } from "./consultas.repositorio.ts";

function criarApp() {
  const banco = new DatabaseSync(":memory:");
  const repositorioProfissionais = criarRepositorioProfissionais(banco);
  const repositorioConsultas = criarRepositorioConsultas(banco);

  const profissional = repositorioProfissionais.cadastrar({
    nome: "Dra. Cecília",
    especialidade: "Clínico geral",
    grade: [{ diaSemana: 2, inicio: 8 * 60, fim: 12 * 60 }],
  });

  return {
    app: criarRotasAgenda(repositorioConsultas, repositorioProfissionais),
    profissionalId: profissional.id,
  };
}

test("POST /consultas marca e responde 201", async () => {
  const { app, profissionalId } = criarApp();

  const resposta = await app.request("/consultas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profissionalId,
      pacienteId: 10,
      data: "2026-08-04",
      inicio: 9 * 60,
    }),
  });

  expect(resposta.status).toBe(201);
  expect(await resposta.json()).toMatchObject({
    profissionalId,
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });
});

test("POST /consultas fora da grade responde 422 com a mensagem da spec", async () => {
  const { app, profissionalId } = criarApp();

  const resposta = await app.request("/consultas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profissionalId,
      pacienteId: 10,
      data: "2026-08-04",
      inicio: 14 * 60,
    }),
  });

  expect(resposta.status).toBe(422);
  expect(await resposta.json()).toEqual({
    erro: "Profissional não atende neste horário",
  });
});

test("POST /consultas em horário ocupado responde 422 com a mensagem da spec", async () => {
  const { app, profissionalId } = criarApp();

  await app.request("/consultas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profissionalId,
      pacienteId: 10,
      data: "2026-08-04",
      inicio: 9 * 60,
    }),
  });

  const resposta = await app.request("/consultas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profissionalId,
      pacienteId: 20,
      data: "2026-08-04",
      inicio: 9 * 60,
    }),
  });

  expect(resposta.status).toBe(422);
  expect(await resposta.json()).toEqual({ erro: "Horário já ocupado" });
});

test("POST /consultas/:id/cancelamento libera o horário para nova marcação", async () => {
  const { app, profissionalId } = criarApp();

  const marcada = (await (
    await app.request("/consultas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profissionalId,
        pacienteId: 10,
        data: "2026-08-04",
        inicio: 9 * 60,
      }),
    })
  ).json()) as Consulta;

  const respostaCancelamento = await app.request(
    `/consultas/${marcada.id}/cancelamento`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo: "Paciente desmarcou" }),
    },
  );

  expect(respostaCancelamento.status).toBe(200);
  expect(await respostaCancelamento.json()).toMatchObject({
    status: "cancelada",
    motivoCancelamento: "Paciente desmarcou",
  });

  const respostaNovaMarcacao = await app.request("/consultas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profissionalId,
      pacienteId: 20,
      data: "2026-08-04",
      inicio: 9 * 60,
    }),
  });

  expect(respostaNovaMarcacao.status).toBe(201);
});

test("POST /consultas/:id/cancelamento com id inexistente responde 404 sem mensagem", async () => {
  const { app } = criarApp();

  const resposta = await app.request("/consultas/999/cancelamento", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ motivo: "Paciente desmarcou" }),
  });

  expect(resposta.status).toBe(404);
  expect(await resposta.text()).toBe("");
});
