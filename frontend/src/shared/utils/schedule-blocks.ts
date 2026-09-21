import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO";
import { sessionStart } from "@/shared/utils/class-session-helpers";

export interface ScheduleBlock {
  key: string;
  recurrenceUuid: string | null;
  sessions: ClassSessionDTO[];
}

const byStart = (a: ClassSessionDTO, b: ClassSessionDTO): number =>
  sessionStart(a).getTime() - sessionStart(b).getTime();

// Agrupa as aulas de uma mesma recorrência em um único bloco; aulas avulsas viram
// blocos de uma aula só. Uma passada sobre a lista + uma ordenação por bloco.
// Dentro do bloco as datas ficam em ordem crescente (primeira → última aula da série);
// os blocos são listados da mais recente para a mais antiga.
export function buildScheduleBlocks(sessions: ClassSessionDTO[]): ScheduleBlock[] {
  const series = new Map<string, ClassSessionDTO[]>();
  const blocks: ScheduleBlock[] = [];

  for (const session of sessions) {
    if (!session.recurrenceGroupUuid) {
      blocks.push({ key: `u:${session.uuid}`, recurrenceUuid: null, sessions: [session] });
      continue;
    }

    const list = series.get(session.recurrenceGroupUuid);
    if (list) list.push(session);
    else series.set(session.recurrenceGroupUuid, [session]);
  }

  for (const [recurrenceUuid, list] of series) {
    blocks.push({ key: `s:${recurrenceUuid}`, recurrenceUuid, sessions: list.sort(byStart) });
  }

  return blocks.sort((a, b) => byStart(b.sessions[0], a.sessions[0]));
}
