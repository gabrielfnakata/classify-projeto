export interface ClassGroupStudentSummaryDTO {
    uuid: string;
    name: string;
}

export interface ClassGroupDTO {
    uuid: string;
    name: string;
    description: string | null;
    students: ClassGroupStudentSummaryDTO[];
}
