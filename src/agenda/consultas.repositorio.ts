import { DatabaseSync } from "node:sqlite";

export type StatusConsulta = "marcada" | "cancelada";

export type Consulta = {
  id: number;
  profissionalId: number;
  pacienteId: number;
  data: string;
  inicio: number;
  fim: number;
  status: StatusConsulta;
  motivoCancelamento: string | null;
};

export type NovaConsulta = {
  profissionalId: number;
  pacienteId: number;
  data: string;
  inicio: number;
  fim: number;
};

type LinhaConsulta = {
  id: number;
  prof_id: number;
  data: string;
  inicio: number;
  fim: number;
  paciente_id: number;
  status: StatusConsulta;
  motivo_cancelamento: string | null;
};

function linhaParaConsulta(linha: LinhaConsulta): Consulta {
  return {
    id: linha.id,
    profissionalId: linha.prof_id,
    pacienteId: linha.paciente_id,
    data: linha.data,
    inicio: linha.inicio,
    fim: linha.fim,
    status: linha.status,
    motivoCancelamento: linha.motivo_cancelamento,
  };
}

export function criarRepositorioConsultas(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS consulta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prof_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      inicio INTEGER NOT NULL,
      fim INTEGER NOT NULL,
      paciente_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'marcada',
      motivo_cancelamento TEXT
    )
  `);

  function marcar(nova: NovaConsulta): Consulta {
    const inserir = db.prepare(
      "INSERT INTO consulta (prof_id, data, inicio, fim, paciente_id) VALUES (?, ?, ?, ?, ?)",
    );
    const resultado = inserir.run(
      nova.profissionalId,
      nova.data,
      nova.inicio,
      nova.fim,
      nova.pacienteId,
    );
    const id = Number(resultado.lastInsertRowid);

    return { id, ...nova, status: "marcada", motivoCancelamento: null };
  }

  function listarPorProfissionalEData(
    profissionalId: number,
    data: string,
  ): Consulta[] {
    const linhas = db
      .prepare(
        "SELECT id, prof_id, data, inicio, fim, paciente_id, status, motivo_cancelamento FROM consulta WHERE prof_id = ? AND data = ? AND status = 'marcada'",
      )
      .all(profissionalId, data) as LinhaConsulta[];

    return linhas.map(linhaParaConsulta);
  }

  function listarPorMes(mes: string): Consulta[] {
    const linhas = db
      .prepare(
        "SELECT id, prof_id, data, inicio, fim, paciente_id, status, motivo_cancelamento FROM consulta WHERE data LIKE ?",
      )
      .all(`${mes}-%`) as LinhaConsulta[];

    return linhas.map(linhaParaConsulta);
  }

  function buscarPorId(id: number): Consulta | undefined {
    const linha = db
      .prepare(
        "SELECT id, prof_id, data, inicio, fim, paciente_id, status, motivo_cancelamento FROM consulta WHERE id = ?",
      )
      .get(id) as LinhaConsulta | undefined;

    if (!linha) return undefined;

    return linhaParaConsulta(linha);
  }

  function cancelar(id: number, motivo: string): Consulta | undefined {
    const atualizar = db.prepare(
      "UPDATE consulta SET status = 'cancelada', motivo_cancelamento = ? WHERE id = ? AND status = 'marcada'",
    );
    const resultado = atualizar.run(motivo, id);

    if (Number(resultado.changes) === 0) return undefined;

    return buscarPorId(id);
  }

  return {
    marcar,
    listarPorProfissionalEData,
    listarPorMes,
    buscarPorId,
    cancelar,
  };
}

export type RepositorioConsultas = ReturnType<
  typeof criarRepositorioConsultas
>;
