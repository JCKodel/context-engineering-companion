export function diaDaSemana(data: string): number {
  const partes = data.split("-");
  const ano = Number(partes[0]);
  const mes = Number(partes[1]);
  const dia = Number(partes[2]);
  return new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();
}
