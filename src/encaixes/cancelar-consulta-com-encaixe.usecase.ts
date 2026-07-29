import type {
  PedidoCancelamento,
  criarCancelarConsulta,
} from "../agenda/cancelar-consulta.usecase.ts";
import { ErroMarcarConsulta } from "../agenda/marcar-consulta.usecase.ts";
import type { criarMarcarConsulta } from "../agenda/marcar-consulta.usecase.ts";
import type { RepositorioListaDeEspera } from "./lista-de-espera.repositorio.ts";

type CancelarConsulta = ReturnType<typeof criarCancelarConsulta>;
type MarcarConsulta = ReturnType<typeof criarMarcarConsulta>;

export function criarCancelarConsultaComEncaixe(
  repositorioListaDeEspera: RepositorioListaDeEspera,
  cancelarConsulta: CancelarConsulta,
  marcarConsulta: MarcarConsulta,
) {
  return function cancelarConsultaComEncaixe(
    pedido: PedidoCancelamento,
  ): ReturnType<CancelarConsulta> {
    const consultaCancelada = cancelarConsulta(pedido);

    const espera = repositorioListaDeEspera.listarPorProfissionalEData(
      consultaCancelada.profissionalId,
      consultaCancelada.data,
    );

    for (const entrada of espera) {
      try {
        marcarConsulta({
          profissionalId: consultaCancelada.profissionalId,
          pacienteId: entrada.pacienteId,
          data: consultaCancelada.data,
          inicio: consultaCancelada.inicio,
        });
        repositorioListaDeEspera.remover(entrada.id);
        break;
      } catch (erro) {
        if (erro instanceof ErroMarcarConsulta) {
          continue;
        }
        throw erro;
      }
    }

    return consultaCancelada;
  };
}
