import { expect, test } from "vitest";
import type {
  NovoProfissional,
  Profissional,
  RepositorioProfissionais,
} from "../profissionais/profissionais.repositorio.ts";
import type {
  Consulta,
  NovaConsulta,
  RepositorioConsultas,
} from "./consultas.repositorio.ts";
import {
  ErroMarcarConsulta,
  criarMarcarConsulta,
} from "./marcar-consulta.usecase.ts";

const PROFISSIONAL_TERCA: Profissional = {
  id: 1,
  nome: "Dra. Cecília",
  especialidade: "Clínico geral",
  grade: [{ diaSemana: 2, inicio: 8 * 60, fim: 12 * 60 }],
};

function criarDubleProfissionais(
  profissional: Profissional | undefined = PROFISSIONAL_TERCA,
): RepositorioProfissionais {
  return {
    cadastrar(novo: NovoProfissional): Profissional {
      return { id: 1, ...novo };
    },
    buscarPorId() {
      return profissional;
    },
  };
}

function criarDubleConsultas(existentes: Consulta[] = []): RepositorioConsultas {
  let proximoId = existentes.length + 1;
  const consultas = [...existentes];
  return {
    marcar(nova: NovaConsulta): Consulta {
      const consulta: Consulta = {
        id: proximoId++,
        ...nova,
        status: "marcada",
        motivoCancelamento: null,
      };
      consultas.push(consulta);
      return consulta;
    },
    listarPorProfissionalEData(profissionalId: number, data: string): Consulta[] {
      return consultas.filter(
        (consulta) =>
          consulta.profissionalId === profissionalId &&
          consulta.data === data &&
          consulta.status === "marcada",
      );
    },
    buscarPorId(id: number): Consulta | undefined {
      return consultas.find((consulta) => consulta.id === id);
    },
    cancelar(id: number, motivo: string): Consulta | undefined {
      const consulta = consultas.find(
        (consulta) => consulta.id === id && consulta.status === "marcada",
      );
      if (!consulta) return undefined;
      consulta.status = "cancelada";
      consulta.motivoCancelamento = motivo;
      return consulta;
    },
  };
}

test("aceita consulta às 9h de terça dentro da grade do profissional", () => {
  const marcarConsulta = criarMarcarConsulta(
    criarDubleConsultas(),
    criarDubleProfissionais(),
  );

  const consulta = marcarConsulta({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-08-04",
    inicio: 9 * 60,
  });

  expect(consulta).toMatchObject({
    profissionalId: 1,
    data: "2026-08-04",
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });
});

test("recusa segunda consulta no mesmo horário com 'Horário já ocupado'", () => {
  const repositorioConsultas = criarDubleConsultas();
  const marcarConsulta = criarMarcarConsulta(
    repositorioConsultas,
    criarDubleProfissionais(),
  );

  marcarConsulta({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-08-04",
    inicio: 9 * 60,
  });

  expect(() =>
    marcarConsulta({
      profissionalId: 1,
      pacienteId: 20,
      data: "2026-08-04",
      inicio: 9 * 60,
    }),
  ).toThrow(new ErroMarcarConsulta("Horário já ocupado"));
});

test("recusa consulta às 14h de terça fora da grade com 'Profissional não atende neste horário'", () => {
  const marcarConsulta = criarMarcarConsulta(
    criarDubleConsultas(),
    criarDubleProfissionais(),
  );

  expect(() =>
    marcarConsulta({
      profissionalId: 1,
      pacienteId: 10,
      data: "2026-08-04",
      inicio: 14 * 60,
    }),
  ).toThrow(new ErroMarcarConsulta("Profissional não atende neste horário"));
});

test("fixa o dia da semana a partir da data: terça (2026-08-04) atende, quarta (2026-08-05) não", () => {
  const marcarConsulta = criarMarcarConsulta(
    criarDubleConsultas(),
    criarDubleProfissionais(),
  );

  expect(() =>
    marcarConsulta({
      profissionalId: 1,
      pacienteId: 10,
      data: "2026-08-04",
      inicio: 9 * 60,
    }),
  ).not.toThrow();

  expect(() =>
    marcarConsulta({
      profissionalId: 1,
      pacienteId: 10,
      data: "2026-08-05",
      inicio: 9 * 60,
    }),
  ).toThrow(new ErroMarcarConsulta("Profissional não atende neste horário"));
});
