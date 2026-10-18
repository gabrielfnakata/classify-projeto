export type ScheduleGroupBy = "SUBJECT" | "EMPLOYEE" | "CLASSROOM" | "CLASS";

export interface ClassSessionSummaryDTO {
    uuid: string;
    upcoming: number;
    today: number;
}
