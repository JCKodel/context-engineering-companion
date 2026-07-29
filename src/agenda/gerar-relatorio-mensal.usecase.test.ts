import { expect, test } from "vitest";
import type { Consulta, RepositorioConsultas } from "./consultas.repositorio.ts";
import { criarGerarRelatorioMensal } from "./gerar-relatorio-mensal.usecase.ts";

function criarDubleConsultas(consultas: Consulta[]): RepositorioConsultas {
  return {
    marcar(): Consulta {
      throw new Error("não usado neste teste");
    },
    listarPorProfissionalEData(): Consulta[] {
      throw new Error("não usado neste teste");
    },
    listarPorMes(mes: string): Consulta[] {
      return consultas.filter((consulta) => consulta.data.startsWith(mes));
    },
    buscarPorId(): Consulta | undefined {
      throw new Error("não usado neste teste");
    },
    cancelar(): Consulta | undefined {
      throw new Error("não usado neste teste");
    },
  };
}

test("separa consultas de cada profissional em dia útil e fim de semana", () => {
  const gerarRelatorioMensal = criarGerarRelatorioMensal(
    criarDubleConsultas([
      {
        id: 1,
        profissionalId: 1,
        pacienteId: 10,
        data: "2026-08-04", // terça
        inicio: 9 * 60,
        fim: 9 * 60 + 30,
        status: "marcada",
        motivoCancelamento: null,
      },
      {
        id: 2,
        profissionalId: 1,
        pacienteId: 20,
        data: "2026-08-01", // sábado
        inicio: 9 * 60,
        fim: 9 * 60 + 30,
        status: "marcada",
        motivoCancelamento: null,
      },
      {
        id: 3,
        profissionalId: 2,
        pacienteId: 30,
        data: "2026-08-02", // domingo
        inicio: 9 * 60,
        fim: 9 * 60 + 30,
        status: "marcada",
        motivoCancelamento: null,
      },
    ]),
  );

  expect(gerarRelatorioMensal("2026-08")).toEqual([
    { profissionalId: 1, diaUtil: 1, fimDeSemana: 1 },
    { profissionalId: 2, diaUtil: 0, fimDeSemana: 1 },
  ]);
});

test("consulta cancelada não entra na contagem", () => {
  const gerarRelatorioMensal = criarGerarRelatorioMensal(
    criarDubleConsultas([
      {
        id: 1,
        profissionalId: 1,
        pacienteId: 10,
        data: "2026-08-04",
        inicio: 9 * 60,
        fim: 9 * 60 + 30,
        status: "cancelada",
        motivoCancelamento: "Paciente desmarcou",
      },
    ]),
  );

  expect(gerarRelatorioMensal("2026-08")).toEqual([]);
});
