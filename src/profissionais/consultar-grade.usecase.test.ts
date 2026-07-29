import { DatabaseSync } from "node:sqlite";
import { expect, test } from "vitest";
import { criarConsultarGrade } from "./consultar-grade.usecase.ts";
import { criarRepositorioProfissionais } from "./profissionais.repositorio.ts";

function montar() {
  const repositorio = criarRepositorioProfissionais(
    new DatabaseSync(":memory:"),
  );
  return { repositorio, consultarGrade: criarConsultarGrade(repositorio) };
}

test("devolve a grade do profissional cadastrado", () => {
  const { repositorio, consultarGrade } = montar();

  const cadastrado = repositorio.cadastrar({
    nome: "Dra. Cecília",
    especialidade: "Clínico geral",
    grade: [{ diaSemana: 2, inicio: 8 * 60, fim: 12 * 60 }],
  });

  expect(consultarGrade(cadastrado.id)).toEqual([
    { diaSemana: 2, inicio: 8 * 60, fim: 12 * 60 },
  ]);
});

test("profissional que não existe tem grade vazia", () => {
  const { consultarGrade } = montar();

  expect(consultarGrade(999)).toEqual([]);
});
