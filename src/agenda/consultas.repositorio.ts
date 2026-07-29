import { DatabaseSync } from "node:sqlite";

export type Consulta = {
  id: number;
  profissionalId: number;
  pacienteId: number;
  data: string;
  inicio: number;
  fim: number;
};

export type NovaConsulta = {
  profissionalId: number;
  pacienteId: number;
  data: string;
  inicio: number;
  fim: number;
};

export function criarRepositorioConsultas(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS consulta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prof_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      inicio INTEGER NOT NULL,
      fim INTEGER NOT NULL,
      paciente_id INTEGER NOT NULL
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

    return { id, ...nova };
  }

  function listarPorProfissionalEData(
    profissionalId: number,
    data: string,
  ): Consulta[] {
    const linhas = db
      .prepare(
        "SELECT id, prof_id, data, inicio, fim, paciente_id FROM consulta WHERE prof_id = ? AND data = ?",
      )
      .all(profissionalId, data) as {
      id: number;
      prof_id: number;
      data: string;
      inicio: number;
      fim: number;
      paciente_id: number;
    }[];

    return linhas.map((linha) => ({
      id: linha.id,
      profissionalId: linha.prof_id,
      pacienteId: linha.paciente_id,
      data: linha.data,
      inicio: linha.inicio,
      fim: linha.fim,
    }));
  }

  return { marcar, listarPorProfissionalEData };
}

export type RepositorioConsultas = ReturnType<
  typeof criarRepositorioConsultas
>;
