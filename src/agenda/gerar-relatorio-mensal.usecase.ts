import type { RepositorioConsultas } from "./consultas.repositorio.ts";
import { diaDaSemana } from "./dia-da-semana.ts";

const DOMINGO = 0;
const SABADO = 6;

export type LinhaRelatorioMensal = {
  profissionalId: number;
  diaUtil: number;
  fimDeSemana: number;
};

export function criarGerarRelatorioMensal(
  repositorioConsultas: RepositorioConsultas,
) {
  return function gerarRelatorioMensal(mes: string): LinhaRelatorioMensal[] {
    const consultas = repositorioConsultas
      .listarPorMes(mes)
      .filter((consulta) => consulta.status === "marcada");

    const porProfissional = new Map<number, LinhaRelatorioMensal>();

    for (const consulta of consultas) {
      const linha = porProfissional.get(consulta.profissionalId) ?? {
        profissionalId: consulta.profissionalId,
        diaUtil: 0,
        fimDeSemana: 0,
      };

      const dia = diaDaSemana(consulta.data);
      if (dia === DOMINGO || dia === SABADO) {
        linha.fimDeSemana += 1;
      } else {
        linha.diaUtil += 1;
      }

      porProfissional.set(consulta.profissionalId, linha);
    }

    return [...porProfissional.values()];
  };
}
