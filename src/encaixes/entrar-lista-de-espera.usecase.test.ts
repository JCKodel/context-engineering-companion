import { expect, test } from "vitest";
import type {
  EntradaListaDeEspera,
  NovaEntradaListaDeEspera,
  RepositorioListaDeEspera,
} from "./lista-de-espera.repositorio.ts";
import { criarEntrarListaDeEspera } from "./entrar-lista-de-espera.usecase.ts";

function criarDubleListaDeEspera(): RepositorioListaDeEspera {
  let proximoId = 1;
  const entradas: EntradaListaDeEspera[] = [];
  return {
    entrar(nova: NovaEntradaListaDeEspera): EntradaListaDeEspera {
      const entrada = { id: proximoId++, ...nova };
      entradas.push(entrada);
      return entrada;
    },
    listarPorProfissionalEData(
      profissionalId: number,
      data: string,
    ): EntradaListaDeEspera[] {
      return entradas.filter(
        (entrada) =>
          entrada.profissionalId === profissionalId && entrada.data === data,
      );
    },
    remover(id: number): void {
      const indice = entradas.findIndex((entrada) => entrada.id === id);
      if (indice >= 0) entradas.splice(indice, 1);
    },
  };
}

test("registra paciente na lista de espera do profissional na data pretendida", () => {
  const entrarListaDeEspera = criarEntrarListaDeEspera(
    criarDubleListaDeEspera(),
  );

  const entrada = entrarListaDeEspera({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-08-04",
  });

  expect(entrada).toMatchObject({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-08-04",
  });
});
