import { DatabaseSync } from "node:sqlite";
import { expect, test } from "vitest";
import { criarCancelarConsulta } from "../agenda/cancelar-consulta.usecase.ts";
import { criarRepositorioConsultas } from "../agenda/consultas.repositorio.ts";
import { criarMarcarConsulta } from "../agenda/marcar-consulta.usecase.ts";
import { criarConsultarGrade } from "../profissionais/consultar-grade.usecase.ts";
import { criarRepositorioProfissionais } from "../profissionais/profissionais.repositorio.ts";
import { criarRotasEncaixes } from "./encaixes.http.ts";
import { criarRepositorioListaDeEspera } from "./lista-de-espera.repositorio.ts";

function criarApp() {
  const banco = new DatabaseSync(":memory:");
  const repositorioProfissionais = criarRepositorioProfissionais(banco);
  const repositorioConsultas = criarRepositorioConsultas(banco);
  const repositorioListaDeEspera = criarRepositorioListaDeEspera(banco);

  const profissional = repositorioProfissionais.cadastrar({
    nome: "Dra. Cecília",
    especialidade: "Clínico geral",
    grade: [{ diaSemana: 2, inicio: 8 * 60, fim: 12 * 60 }],
  });

  const app = criarRotasEncaixes(
    repositorioListaDeEspera,
    criarCancelarConsulta(repositorioConsultas),
    criarMarcarConsulta(
      repositorioConsultas,
      criarConsultarGrade(repositorioProfissionais),
    ),
  );

  return { app, profissionalId: profissional.id, repositorioConsultas };
}

test("POST /lista-de-espera registra o paciente e responde 201", async () => {
  const { app, profissionalId } = criarApp();

  const resposta = await app.request("/lista-de-espera", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profissionalId,
      pacienteId: 10,
      data: "2026-08-04",
    }),
  });

  expect(resposta.status).toBe(201);
  expect(await resposta.json()).toMatchObject({
    profissionalId,
    pacienteId: 10,
    data: "2026-08-04",
  });
});

test("cancelamento com paciente na lista de espera encaixa o primeiro no horário liberado", async () => {
  const { app, profissionalId, repositorioConsultas } = criarApp();

  const marcada = repositorioConsultas.marcar({
    profissionalId,
    pacienteId: 10,
    data: "2026-08-04",
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });

  await app.request("/lista-de-espera", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profissionalId,
      pacienteId: 20,
      data: "2026-08-04",
    }),
  });

  const resposta = await app.request(`/consultas/${marcada.id}/cancelamento`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ motivo: "Paciente desmarcou" }),
  });

  expect(resposta.status).toBe(200);
  expect(await resposta.json()).toMatchObject({ status: "cancelada" });

  const consultasDoDia = repositorioConsultas.listarPorProfissionalEData(
    profissionalId,
    "2026-08-04",
  );
  expect(consultasDoDia).toMatchObject([{ pacienteId: 20, inicio: 9 * 60 }]);
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
