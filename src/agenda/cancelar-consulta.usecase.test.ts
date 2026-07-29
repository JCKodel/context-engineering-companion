import { expect, test } from "vitest";
import type { Consulta, RepositorioConsultas } from "./consultas.repositorio.ts";
import {
  ErroConsultaNaoEncontrada,
  criarCancelarConsulta,
} from "./cancelar-consulta.usecase.ts";

const CONSULTA_MARCADA: Consulta = {
  id: 1,
  profissionalId: 1,
  pacienteId: 10,
  data: "2026-08-04",
  inicio: 9 * 60,
  fim: 9 * 60 + 30,
  status: "marcada",
  motivoCancelamento: null,
};

function criarDubleConsultas(
  existente: Consulta | undefined = CONSULTA_MARCADA,
): RepositorioConsultas {
  return {
    marcar(): Consulta {
      throw new Error("não usado neste teste");
    },
    listarPorProfissionalEData(): Consulta[] {
      return [];
    },
    buscarPorId(): Consulta | undefined {
      return existente;
    },
    cancelar(id: number, motivo: string): Consulta | undefined {
      if (!existente || existente.id !== id || existente.status === "cancelada") {
        return undefined;
      }
      return { ...existente, status: "cancelada", motivoCancelamento: motivo };
    },
  };
}

test("cancela consulta existente e devolve com o motivo", () => {
  const cancelarConsulta = criarCancelarConsulta(criarDubleConsultas());

  const consulta = cancelarConsulta({
    consultaId: 1,
    motivo: "Paciente desmarcou",
  });

  expect(consulta).toMatchObject({
    status: "cancelada",
    motivoCancelamento: "Paciente desmarcou",
  });
});

test("lança ErroConsultaNaoEncontrada para id inexistente", () => {
  const cancelarConsulta = criarCancelarConsulta(
    criarDubleConsultas(undefined),
  );

  expect(() =>
    cancelarConsulta({ consultaId: 999, motivo: "Paciente desmarcou" }),
  ).toThrow(ErroConsultaNaoEncontrada);
});

test("lança ErroConsultaNaoEncontrada para consulta já cancelada", () => {
  const cancelarConsulta = criarCancelarConsulta(
    criarDubleConsultas({ ...CONSULTA_MARCADA, status: "cancelada", motivoCancelamento: "Já cancelada antes" }),
  );

  expect(() =>
    cancelarConsulta({ consultaId: 1, motivo: "Segunda tentativa" }),
  ).toThrow(ErroConsultaNaoEncontrada);
});
