import { DatabaseSync } from "node:sqlite";
import { expect, test } from "vitest";
import { criarRepositorioConsultas } from "./consultas.repositorio.ts";

test("marca e lista consulta por profissional e data no formato herdado", () => {
  const repositorio = criarRepositorioConsultas(new DatabaseSync(":memory:"));

  const marcada = repositorio.marcar({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-08-04",
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });

  const consultasDoDia = repositorio.listarPorProfissionalEData(1, "2026-08-04");

  expect(consultasDoDia).toEqual([marcada]);
});

test("não lista consulta de outro profissional ou outra data", () => {
  const repositorio = criarRepositorioConsultas(new DatabaseSync(":memory:"));

  repositorio.marcar({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-08-04",
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });

  expect(repositorio.listarPorProfissionalEData(2, "2026-08-04")).toEqual([]);
  expect(repositorio.listarPorProfissionalEData(1, "2026-08-05")).toEqual([]);
});

test("cancela consulta: guarda o motivo e muda o status, sem apagar a linha", () => {
  const repositorio = criarRepositorioConsultas(new DatabaseSync(":memory:"));

  const marcada = repositorio.marcar({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-08-04",
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });

  const cancelada = repositorio.cancelar(marcada.id, "Paciente desmarcou");

  expect(cancelada).toEqual({
    ...marcada,
    status: "cancelada",
    motivoCancelamento: "Paciente desmarcou",
  });
  expect(repositorio.buscarPorId(marcada.id)).toEqual(cancelada);
});

test("consulta cancelada some de listarPorProfissionalEData mas continua no banco", () => {
  const repositorio = criarRepositorioConsultas(new DatabaseSync(":memory:"));

  const marcada = repositorio.marcar({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-08-04",
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });

  repositorio.cancelar(marcada.id, "Paciente desmarcou");

  expect(repositorio.listarPorProfissionalEData(1, "2026-08-04")).toEqual([]);
  expect(repositorio.buscarPorId(marcada.id)).toMatchObject({
    status: "cancelada",
  });
});

test("cancelar consulta inexistente retorna undefined", () => {
  const repositorio = criarRepositorioConsultas(new DatabaseSync(":memory:"));

  expect(repositorio.cancelar(999, "motivo qualquer")).toBeUndefined();
});

test("cancelar consulta já cancelada retorna undefined", () => {
  const repositorio = criarRepositorioConsultas(new DatabaseSync(":memory:"));

  const marcada = repositorio.marcar({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-08-04",
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });

  repositorio.cancelar(marcada.id, "Paciente desmarcou");

  expect(repositorio.cancelar(marcada.id, "Segunda tentativa")).toBeUndefined();
});
