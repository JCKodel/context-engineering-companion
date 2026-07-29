import { DatabaseSync } from "node:sqlite";

export type EntradaListaDeEspera = {
  id: number;
  profissionalId: number;
  pacienteId: number;
  data: string;
};

export type NovaEntradaListaDeEspera = {
  profissionalId: number;
  pacienteId: number;
  data: string;
};

type LinhaEntrada = {
  id: number;
  prof_id: number;
  paciente_id: number;
  data: string;
};

function linhaParaEntrada(linha: LinhaEntrada): EntradaListaDeEspera {
  return {
    id: linha.id,
    profissionalId: linha.prof_id,
    pacienteId: linha.paciente_id,
    data: linha.data,
  };
}

export function criarRepositorioListaDeEspera(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS lista_espera (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prof_id INTEGER NOT NULL,
      paciente_id INTEGER NOT NULL,
      data TEXT NOT NULL
    )
  `);

  function entrar(nova: NovaEntradaListaDeEspera): EntradaListaDeEspera {
    const inserir = db.prepare(
      "INSERT INTO lista_espera (prof_id, paciente_id, data) VALUES (?, ?, ?)",
    );
    const resultado = inserir.run(
      nova.profissionalId,
      nova.pacienteId,
      nova.data,
    );
    const id = Number(resultado.lastInsertRowid);

    return { id, ...nova };
  }

  function listarPorProfissionalEData(
    profissionalId: number,
    data: string,
  ): EntradaListaDeEspera[] {
    const linhas = db
      .prepare(
        "SELECT id, prof_id, paciente_id, data FROM lista_espera WHERE prof_id = ? AND data = ? ORDER BY id ASC",
      )
      .all(profissionalId, data) as LinhaEntrada[];

    return linhas.map(linhaParaEntrada);
  }

  function remover(id: number): void {
    db.prepare("DELETE FROM lista_espera WHERE id = ?").run(id);
  }

  return { entrar, listarPorProfissionalEData, remover };
}

export type RepositorioListaDeEspera = ReturnType<
  typeof criarRepositorioListaDeEspera
>;
