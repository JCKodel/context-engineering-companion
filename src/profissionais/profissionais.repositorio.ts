import { DatabaseSync } from "node:sqlite";

export type FaixaGrade = {
  diaSemana: number;
  inicio: number;
  fim: number;
};

export type Profissional = {
  id: number;
  nome: string;
  especialidade: string;
  grade: FaixaGrade[];
};

export type NovoProfissional = {
  nome: string;
  especialidade: string;
  grade: FaixaGrade[];
};

export function criarRepositorioProfissionais(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profissional (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      especialidade TEXT NOT NULL
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS grade (
      prof_id INTEGER NOT NULL,
      dia_semana INTEGER NOT NULL,
      inicio INTEGER NOT NULL,
      fim INTEGER NOT NULL
    )
  `);

  function cadastrar(novo: NovoProfissional): Profissional {
    const inserirProfissional = db.prepare(
      "INSERT INTO profissional (nome, especialidade) VALUES (?, ?)",
    );
    const resultado = inserirProfissional.run(
      novo.nome,
      novo.especialidade,
    );
    const id = Number(resultado.lastInsertRowid);

    const inserirFaixa = db.prepare(
      "INSERT INTO grade (prof_id, dia_semana, inicio, fim) VALUES (?, ?, ?, ?)",
    );
    for (const faixa of novo.grade) {
      inserirFaixa.run(id, faixa.diaSemana, faixa.inicio, faixa.fim);
    }

    return { id, nome: novo.nome, especialidade: novo.especialidade, grade: novo.grade };
  }

  function buscarPorId(id: number): Profissional | undefined {
    const profissional = db
      .prepare("SELECT id, nome, especialidade FROM profissional WHERE id = ?")
      .get(id) as { id: number; nome: string; especialidade: string } | undefined;

    if (!profissional) return undefined;

    const grade = db
      .prepare("SELECT dia_semana, inicio, fim FROM grade WHERE prof_id = ?")
      .all(id) as { dia_semana: number; inicio: number; fim: number }[];

    return {
      id: profissional.id,
      nome: profissional.nome,
      especialidade: profissional.especialidade,
      grade: grade.map((faixa) => ({
        diaSemana: faixa.dia_semana,
        inicio: faixa.inicio,
        fim: faixa.fim,
      })),
    };
  }

  return { cadastrar, buscarPorId };
}

export type RepositorioProfissionais = ReturnType<
  typeof criarRepositorioProfissionais
>;
