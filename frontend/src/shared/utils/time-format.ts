const pad2 = (n: number): string => String(n).padStart(2, "0");

/** 15/09/2026 */
export const formatDMY = (d: Date): string =>
  `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;

/** 07:30 */
export const formatHM = (d: Date): string => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

/** Duração legível a partir de minutos: "45 min", "1 h", "1,5 h", "2 h", "1 h 40". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (rest === 0) return `${hours} h`;
  if (rest === 30) return `${hours},5 h`;
  return `${hours} h ${rest}`;
}
