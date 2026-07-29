import { DatabaseSync } from "node:sqlite";
import { expect, test } from "vitest";
import { criarRepositorioListaDeEspera } from "./lista-de-espera.repositorio.ts";

test("entra na lista e lista por profissional e data em ordem de chegada", () => {
  const repositorio = criarRepositorioListaDeEspera(new DatabaseSync(":memory:"));

  const primeiro = repositorio.entrar({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-08-04",
  });
  const segundo = repositorio.entrar({
    profissionalId: 1,
    pacienteId: 20,
    data: "2026-08-04",
  });

  expect(repositorio.listarPorProfissionalEData(1, "2026-08-04")).toEqual([
    primeiro,
    segundo,
  ]);
});

test("não lista entrada de outro profissional ou outra data", () => {
  const repositorio = criarRepositorioListaDeEspera(new DatabaseSync(":memory:"));

  repositorio.entrar({ profissionalId: 1, pacienteId: 10, data: "2026-08-04" });

  expect(repositorio.listarPorProfissionalEData(2, "2026-08-04")).toEqual([]);
  expect(repositorio.listarPorProfissionalEData(1, "2026-08-05")).toEqual([]);
});

test("remove entrada da lista", () => {
  const repositorio = criarRepositorioListaDeEspera(new DatabaseSync(":memory:"));

  const entrada = repositorio.entrar({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-08-04",
  });
  repositorio.remover(entrada.id);

  expect(repositorio.listarPorProfissionalEData(1, "2026-08-04")).toEqual([]);
});
