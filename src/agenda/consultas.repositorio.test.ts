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

test("lista consulta do mês de qualquer profissional, sem contar nem classificar", () => {
  const repositorio = criarRepositorioConsultas(new DatabaseSync(":memory:"));

  const doProfissional1 = repositorio.marcar({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-08-04",
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });
  const doProfissional2 = repositorio.marcar({
    profissionalId: 2,
    pacienteId: 20,
    data: "2026-08-20",
    inicio: 14 * 60,
    fim: 14 * 60 + 30,
  });

  expect(repositorio.listarPorMes("2026-08")).toEqual([
    doProfissional1,
    doProfissional2,
  ]);
});

test("não lista consulta de outro mês", () => {
  const repositorio = criarRepositorioConsultas(new DatabaseSync(":memory:"));

  repositorio.marcar({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-07-31",
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });
  repositorio.marcar({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-09-01",
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });

  expect(repositorio.listarPorMes("2026-08")).toEqual([]);
});

test("consulta cancelada aparece crua na lista do mês (contar ou não ainda depende de resposta da coordenação)", () => {
  const repositorio = criarRepositorioConsultas(new DatabaseSync(":memory:"));

  const marcada = repositorio.marcar({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-08-04",
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });
  const cancelada = repositorio.cancelar(marcada.id, "Paciente desmarcou");

  expect(repositorio.listarPorMes("2026-08")).toEqual([cancelada]);
});
