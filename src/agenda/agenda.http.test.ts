import { DatabaseSync } from "node:sqlite";
import { expect, test } from "vitest";
import { criarRepositorioProfissionais } from "../profissionais/profissionais.repositorio.ts";
import { criarRotasAgenda } from "./agenda.http.ts";
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
    repositorioConsultas,
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

test("GET /relatorios/mensal soma consultas por profissional, separadas em dia útil e fim de semana", async () => {
  const { app, profissionalId, repositorioConsultas } = criarApp();

  repositorioConsultas.marcar({
    profissionalId,
    pacienteId: 10,
    data: "2026-08-04", // terça
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });
  repositorioConsultas.marcar({
    profissionalId,
    pacienteId: 20,
    data: "2026-08-01", // sábado
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });

  const resposta = await app.request("/relatorios/mensal?mes=2026-08");

  expect(resposta.status).toBe(200);
  expect(await resposta.json()).toEqual([
    { profissionalId, diaUtil: 1, fimDeSemana: 1 },
  ]);
});

test("GET /relatorios/mensal não conta consulta cancelada", async () => {
  const { app, profissionalId, repositorioConsultas } = criarApp();

  const marcada = repositorioConsultas.marcar({
    profissionalId,
    pacienteId: 10,
    data: "2026-08-04",
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });
  repositorioConsultas.cancelar(marcada.id, "Paciente desmarcou");

  const resposta = await app.request("/relatorios/mensal?mes=2026-08");

  expect(resposta.status).toBe(200);
  expect(await resposta.json()).toEqual([]);
});
