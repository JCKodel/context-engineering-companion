import { DatabaseSync } from "node:sqlite";
import { expect, test } from "vitest";
import { criarRepositorioProfissionais } from "./profissionais.repositorio.ts";

test("cadastra e busca profissional com a grade no formato herdado", () => {
  const repositorio = criarRepositorioProfissionais(new DatabaseSync(":memory:"));

  const cadastrado = repositorio.cadastrar({
    nome: "Dra. Cecília",
    especialidade: "Clínico geral",
    grade: [
      { diaSemana: 2, inicio: 8 * 60, fim: 12 * 60 },
      { diaSemana: 4, inicio: 14 * 60, fim: 18 * 60 },
    ],
  });

  const encontrado = repositorio.buscarPorId(cadastrado.id);

  expect(encontrado).toEqual(cadastrado);
});

test("busca por id inexistente devolve undefined", () => {
  const repositorio = criarRepositorioProfissionais(new DatabaseSync(":memory:"));

  expect(repositorio.buscarPorId(999)).toBeUndefined();
});
