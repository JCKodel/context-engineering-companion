import type { Consulta, RepositorioConsultas } from "./consultas.repositorio.ts";

export class ErroConsultaNaoEncontrada extends Error {}

export type PedidoCancelamento = {
  consultaId: number;
  motivo: string;
};

export function criarCancelarConsulta(
  repositorioConsultas: RepositorioConsultas,
) {
  return function cancelarConsulta(pedido: PedidoCancelamento): Consulta {
    const consulta = repositorioConsultas.cancelar(
      pedido.consultaId,
      pedido.motivo,
    );

    if (!consulta) {
      throw new ErroConsultaNaoEncontrada();
    }

    return consulta;
  };
}
