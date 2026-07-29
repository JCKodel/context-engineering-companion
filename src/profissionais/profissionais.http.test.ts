import { DatabaseSync } from "node:sqlite";
import { expect, test } from "vitest";
import { criarRotasProfissionais } from "./profissionais.http.ts";
import { criarRepositorioProfissionais } from "./profissionais.repositorio.ts";

function criarApp() {
  return criarRotasProfissionais(
    criarRepositorioProfissionais(new DatabaseSync(":memory:")),
  );
}

test("POST /profissionais cadastra e responde 201", async () => {
  const app = criarApp();

  const resposta = await app.request("/profissionais", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Dra. Cecília",
      especialidade: "Clínico geral",
      grade: [{ diaSemana: 2, inicio: 480, fim: 720 }],
    }),
  });

  expect(resposta.status).toBe(201);
  expect(await resposta.json()).toMatchObject({ nome: "Dra. Cecília" });
});

test("POST /profissionais com grade vazia responde 422 com a mensagem da spec", async () => {
  const app = criarApp();

  const resposta = await app.request("/profissionais", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Dra. Cecília",
      especialidade: "Clínico geral",
      grade: [],
    }),
  });

  expect(resposta.status).toBe(422);
  expect(await resposta.json()).toEqual({
    erro: "Profissional precisa de pelo menos um dia de atendimento",
  });
});

test("POST /profissionais com faixa inválida responde 422 com a mensagem da spec", async () => {
  const app = criarApp();

  const resposta = await app.request("/profissionais", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Dra. Cecília",
      especialidade: "Clínico geral",
      grade: [{ diaSemana: 2, inicio: 495, fim: 720 }],
    }),
  });

  expect(resposta.status).toBe(422);
  expect(await resposta.json()).toEqual({
    erro: "Faixa de atendimento inválida",
  });
});
