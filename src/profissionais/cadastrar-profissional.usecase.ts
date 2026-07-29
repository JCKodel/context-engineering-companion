import type {
  NovoProfissional,
  Profissional,
  RepositorioProfissionais,
} from "./profissionais.repositorio.ts";

export class ErroCadastroProfissional extends Error {}

const MINUTOS_POR_FAIXA = 30;

function faixaValida(inicio: number, fim: number): boolean {
  return (
    inicio < fim &&
    inicio % MINUTOS_POR_FAIXA === 0 &&
    fim % MINUTOS_POR_FAIXA === 0
  );
}

export function criarCadastrarProfissional(
  repositorio: RepositorioProfissionais,
) {
  return function cadastrarProfissional(
    novo: NovoProfissional,
  ): Profissional {
    if (novo.grade.length === 0) {
      throw new ErroCadastroProfissional(
        "Profissional precisa de pelo menos um dia de atendimento",
      );
    }

    for (const faixa of novo.grade) {
      if (!faixaValida(faixa.inicio, faixa.fim)) {
        throw new ErroCadastroProfissional("Faixa de atendimento inválida");
      }
    }

    return repositorio.cadastrar(novo);
  };
}
