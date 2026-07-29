import type {
  EntradaListaDeEspera,
  RepositorioListaDeEspera,
} from "./lista-de-espera.repositorio.ts";

export type PedidoEntradaListaDeEspera = {
  profissionalId: number;
  pacienteId: number;
  data: string;
};

export function criarEntrarListaDeEspera(
  repositorioListaDeEspera: RepositorioListaDeEspera,
) {
  return function entrarListaDeEspera(
    pedido: PedidoEntradaListaDeEspera,
  ): EntradaListaDeEspera {
    return repositorioListaDeEspera.entrar(pedido);
  };
}
