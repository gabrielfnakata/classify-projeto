/**
 * Janela de tempo que as telas de detalhe pedem ao backend. Sem recorte, a tela puxaria a
 * agenda inteira; três meses para trás cobrem o histórico que ela mostra e um ano à frente
 * cobre qualquer recorrência já lançada.
 */
const MONTHS_BACK = 3;
const MONTHS_AHEAD = 12;

const toIsoLocal = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T00:00:00`;

/** "from=...&to=..." pronto para concatenar na query do /classsession/filter. */
export function scheduleWindowQuery(reference: Date = new Date()): string {
  const from = new Date(reference);
  from.setMonth(from.getMonth() - MONTHS_BACK);

  const to = new Date(reference);
  to.setMonth(to.getMonth() + MONTHS_AHEAD);

  return `from=${toIsoLocal(from)}&to=${toIsoLocal(to)}`;
}
