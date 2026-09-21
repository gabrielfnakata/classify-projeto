export type ScheduleGroupBy = "SUBJECT" | "EMPLOYEE" | "CLASSROOM" | "CLASS";

/** Contagem de aulas de uma disciplina, professor, sala ou turma. */
export interface ClassSessionSummaryDTO {
    uuid: string;
    upcoming: number;
    today: number;
}
