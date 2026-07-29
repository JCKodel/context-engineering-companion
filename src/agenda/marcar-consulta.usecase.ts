import type { RepositorioProfissionais } from "../profissionais/profissionais.repositorio.ts";
import type {
  Consulta,
  NovaConsulta,
  RepositorioConsultas,
} from "./consultas.repositorio.ts";
import { diaDaSemana } from "./dia-da-semana.ts";

export class ErroMarcarConsulta extends Error {}

const DURACAO_CONSULTA_MINUTOS = 30;

export type PedidoConsulta = {
  profissionalId: number;
  pacienteId: number;
  data: string;
  inicio: number;
};

function seSobrepoe(
  inicioA: number,
  fimA: number,
  inicioB: number,
  fimB: number,
): boolean {
  return inicioA < fimB && inicioB < fimA;
}

export function criarMarcarConsulta(
  repositorioConsultas: RepositorioConsultas,
  repositorioProfissionais: RepositorioProfissionais,
) {
  return function marcarConsulta(pedido: PedidoConsulta): Consulta {
    const profissional = repositorioProfissionais.buscarPorId(
      pedido.profissionalId,
    );
    const fim = pedido.inicio + DURACAO_CONSULTA_MINUTOS;
    const diaSemana = diaDaSemana(pedido.data);

    const atendeNoHorario = (profissional?.grade ?? []).some(
      (faixa) =>
        faixa.diaSemana === diaSemana &&
        pedido.inicio >= faixa.inicio &&
        fim <= faixa.fim,
    );

    if (!atendeNoHorario) {
      throw new ErroMarcarConsulta("Profissional não atende neste horário");
    }

    const consultasDoDia = repositorioConsultas.listarPorProfissionalEData(
      pedido.profissionalId,
      pedido.data,
    );

    const horarioOcupado = consultasDoDia.some((consulta) =>
      seSobrepoe(pedido.inicio, fim, consulta.inicio, consulta.fim),
    );

    if (horarioOcupado) {
      throw new ErroMarcarConsulta("Horário já ocupado");
    }

    const nova: NovaConsulta = {
      profissionalId: pedido.profissionalId,
      pacienteId: pedido.pacienteId,
      data: pedido.data,
      inicio: pedido.inicio,
      fim,
    };

    return repositorioConsultas.marcar(nova);
  };
}
