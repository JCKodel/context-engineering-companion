import { expect, test } from "vitest";
import {
  ErroCadastroProfissional,
  criarCadastrarProfissional,
} from "./cadastrar-profissional.usecase.ts";
import type {
  NovoProfissional,
  Profissional,
  RepositorioProfissionais,
} from "./profissionais.repositorio.ts";

function criarDubleRepositorio(): RepositorioProfissionais {
  let proximoId = 1;
  return {
    cadastrar(novo: NovoProfissional): Profissional {
      return { id: proximoId++, ...novo };
    },
    buscarPorId() {
      return undefined;
    },
  };
}

test("cadastra profissional com grade válida", () => {
  const cadastrarProfissional = criarCadastrarProfissional(
    criarDubleRepositorio(),
  );

  const profissional = cadastrarProfissional({
    nome: "Dra. Cecília",
    especialidade: "Clínico geral",
    grade: [{ diaSemana: 2, inicio: 8 * 60, fim: 12 * 60 }],
  });

  expect(profissional).toMatchObject({
    nome: "Dra. Cecília",
    especialidade: "Clínico geral",
    grade: [{ diaSemana: 2, inicio: 480, fim: 720 }],
  });
});

test("recusa grade vazia", () => {
  const cadastrarProfissional = criarCadastrarProfissional(
    criarDubleRepositorio(),
  );

  expect(() =>
    cadastrarProfissional({
      nome: "Dra. Cecília",
      especialidade: "Clínico geral",
      grade: [],
    }),
  ).toThrow(
    new ErroCadastroProfissional(
      "Profissional precisa de pelo menos um dia de atendimento",
    ),
  );
});

test("recusa faixa com início depois do fim", () => {
  const cadastrarProfissional = criarCadastrarProfissional(
    criarDubleRepositorio(),
  );

  expect(() =>
    cadastrarProfissional({
      nome: "Dra. Cecília",
      especialidade: "Clínico geral",
      grade: [{ diaSemana: 2, inicio: 12 * 60, fim: 8 * 60 }],
    }),
  ).toThrow(new ErroCadastroProfissional("Faixa de atendimento inválida"));
});

test("recusa faixa fora de hora cheia ou meia hora", () => {
  const cadastrarProfissional = criarCadastrarProfissional(
    criarDubleRepositorio(),
  );

  expect(() =>
    cadastrarProfissional({
      nome: "Dra. Cecília",
      especialidade: "Clínico geral",
      grade: [{ diaSemana: 2, inicio: 8 * 60 + 15, fim: 12 * 60 }],
    }),
  ).toThrow(new ErroCadastroProfissional("Faixa de atendimento inválida"));
});
