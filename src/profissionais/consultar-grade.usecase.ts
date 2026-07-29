import type {
  FaixaGrade,
  RepositorioProfissionais,
} from "./profissionais.repositorio.ts";

export type { FaixaGrade };

export function criarConsultarGrade(repositorio: RepositorioProfissionais) {
  return function consultarGrade(profissionalId: number): FaixaGrade[] {
    return repositorio.buscarPorId(profissionalId)?.grade ?? [];
  };
}

export type ConsultarGrade = ReturnType<typeof criarConsultarGrade>;
