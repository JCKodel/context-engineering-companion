import { expect, test } from "vitest";
import { criarCancelarConsulta } from "../agenda/cancelar-consulta.usecase.ts";
import type {
  Consulta,
  NovaConsulta,
  RepositorioConsultas,
} from "../agenda/consultas.repositorio.ts";
import { criarMarcarConsulta } from "../agenda/marcar-consulta.usecase.ts";
import type {
  NovoProfissional,
  Profissional,
  RepositorioProfissionais,
} from "../profissionais/profissionais.repositorio.ts";
import { criarCancelarConsultaComEncaixe } from "./cancelar-consulta-com-encaixe.usecase.ts";
import type {
  EntradaListaDeEspera,
  NovaEntradaListaDeEspera,
  RepositorioListaDeEspera,
} from "./lista-de-espera.repositorio.ts";

const PROFISSIONAL_TERCA: Profissional = {
  id: 1,
  nome: "Dra. Cecília",
  especialidade: "Clínico geral",
  grade: [{ diaSemana: 2, inicio: 8 * 60, fim: 12 * 60 }],
};

function criarDubleProfissionaisMutavel(inicial: Profissional) {
  let atual = inicial;
  const repositorio: RepositorioProfissionais = {
    cadastrar(novo: NovoProfissional): Profissional {
      return { id: 1, ...novo };
    },
    buscarPorId(): Profissional | undefined {
      return atual;
    },
  };
  return {
    repositorio,
    mudarGrade(grade: Profissional["grade"]) {
      atual = { ...atual, grade };
    },
  };
}

function criarDubleConsultas(existentes: Consulta[] = []): RepositorioConsultas {
  let proximoId = existentes.length + 1;
  const consultas = [...existentes];
  return {
    marcar(nova: NovaConsulta): Consulta {
      const consulta: Consulta = {
        id: proximoId++,
        ...nova,
        status: "marcada",
        motivoCancelamento: null,
      };
      consultas.push(consulta);
      return consulta;
    },
    listarPorProfissionalEData(profissionalId: number, data: string): Consulta[] {
      return consultas.filter(
        (consulta) =>
          consulta.profissionalId === profissionalId &&
          consulta.data === data &&
          consulta.status === "marcada",
      );
    },
    listarPorMes(mes: string): Consulta[] {
      return consultas.filter((consulta) => consulta.data.startsWith(mes));
    },
    buscarPorId(id: number): Consulta | undefined {
      return consultas.find((consulta) => consulta.id === id);
    },
    cancelar(id: number, motivo: string): Consulta | undefined {
      const consulta = consultas.find(
        (consulta) => consulta.id === id && consulta.status === "marcada",
      );
      if (!consulta) return undefined;
      consulta.status = "cancelada";
      consulta.motivoCancelamento = motivo;
      return consulta;
    },
  };
}

function criarDubleListaDeEspera(
  entradasIniciais: EntradaListaDeEspera[] = [],
): RepositorioListaDeEspera {
  let proximoId = entradasIniciais.length + 1;
  const entradas = [...entradasIniciais];
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

test("cancelamento encaixa o primeiro da lista de espera no horário liberado (critério 4)", () => {
  const repositorioConsultas = criarDubleConsultas();
  const marcada = repositorioConsultas.marcar({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-08-04",
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });
  const repositorioListaDeEspera = criarDubleListaDeEspera([
    { id: 1, profissionalId: 1, pacienteId: 99, data: "2026-08-04" },
  ]);
  const { repositorio: repositorioProfissionais } =
    criarDubleProfissionaisMutavel(PROFISSIONAL_TERCA);

  const cancelarConsultaComEncaixe = criarCancelarConsultaComEncaixe(
    repositorioListaDeEspera,
    criarCancelarConsulta(repositorioConsultas),
    criarMarcarConsulta(repositorioConsultas, repositorioProfissionais),
  );

  cancelarConsultaComEncaixe({ consultaId: marcada.id, motivo: "Paciente desmarcou" });

  const consultasDoDia = repositorioConsultas.listarPorProfissionalEData(
    1,
    "2026-08-04",
  );
  expect(consultasDoDia).toMatchObject([{ pacienteId: 99, inicio: 9 * 60 }]);
  expect(repositorioListaDeEspera.listarPorProfissionalEData(1, "2026-08-04")).toEqual(
    [],
  );
});

test("quem entrou primeiro na lista fica com o horário aberto (critério 5)", () => {
  const repositorioConsultas = criarDubleConsultas();
  const marcada = repositorioConsultas.marcar({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-08-04",
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });
  const repositorioListaDeEspera = criarDubleListaDeEspera([
    { id: 1, profissionalId: 1, pacienteId: 91, data: "2026-08-04" },
    { id: 2, profissionalId: 1, pacienteId: 92, data: "2026-08-04" },
  ]);
  const { repositorio: repositorioProfissionais } =
    criarDubleProfissionaisMutavel(PROFISSIONAL_TERCA);

  const cancelarConsultaComEncaixe = criarCancelarConsultaComEncaixe(
    repositorioListaDeEspera,
    criarCancelarConsulta(repositorioConsultas),
    criarMarcarConsulta(repositorioConsultas, repositorioProfissionais),
  );

  cancelarConsultaComEncaixe({ consultaId: marcada.id, motivo: "Paciente desmarcou" });

  const consultasDoDia = repositorioConsultas.listarPorProfissionalEData(
    1,
    "2026-08-04",
  );
  expect(consultasDoDia).toMatchObject([{ pacienteId: 91 }]);
  expect(
    repositorioListaDeEspera.listarPorProfissionalEData(1, "2026-08-04"),
  ).toMatchObject([{ pacienteId: 92 }]);
});

test("horário que não cabe mais na grade vigente passa para o próximo da lista", () => {
  const repositorioConsultas = criarDubleConsultas();
  const marcada = repositorioConsultas.marcar({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-08-04",
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });
  const repositorioListaDeEspera = criarDubleListaDeEspera([
    { id: 1, profissionalId: 1, pacienteId: 91, data: "2026-08-04" },
    { id: 2, profissionalId: 1, pacienteId: 92, data: "2026-08-04" },
  ]);
  const { repositorio: repositorioProfissionais, mudarGrade } =
    criarDubleProfissionaisMutavel(PROFISSIONAL_TERCA);
  mudarGrade([{ diaSemana: 2, inicio: 10 * 60, fim: 12 * 60 }]);

  const cancelarConsultaComEncaixe = criarCancelarConsultaComEncaixe(
    repositorioListaDeEspera,
    criarCancelarConsulta(repositorioConsultas),
    criarMarcarConsulta(repositorioConsultas, repositorioProfissionais),
  );

  cancelarConsultaComEncaixe({ consultaId: marcada.id, motivo: "Paciente desmarcou" });

  expect(
    repositorioConsultas.listarPorProfissionalEData(1, "2026-08-04"),
  ).toEqual([]);
  expect(
    repositorioListaDeEspera.listarPorProfissionalEData(1, "2026-08-04"),
  ).toMatchObject([{ pacienteId: 91 }, { pacienteId: 92 }]);
});

test("lista de espera vazia deixa o horário livre, sem encaixe", () => {
  const repositorioConsultas = criarDubleConsultas();
  const marcada = repositorioConsultas.marcar({
    profissionalId: 1,
    pacienteId: 10,
    data: "2026-08-04",
    inicio: 9 * 60,
    fim: 9 * 60 + 30,
  });
  const repositorioListaDeEspera = criarDubleListaDeEspera();
  const { repositorio: repositorioProfissionais } =
    criarDubleProfissionaisMutavel(PROFISSIONAL_TERCA);

  const cancelarConsultaComEncaixe = criarCancelarConsultaComEncaixe(
    repositorioListaDeEspera,
    criarCancelarConsulta(repositorioConsultas),
    criarMarcarConsulta(repositorioConsultas, repositorioProfissionais),
  );

  const consulta = cancelarConsultaComEncaixe({
    consultaId: marcada.id,
    motivo: "Paciente desmarcou",
  });

  expect(consulta.status).toBe("cancelada");
  expect(
    repositorioConsultas.listarPorProfissionalEData(1, "2026-08-04"),
  ).toEqual([]);
});
