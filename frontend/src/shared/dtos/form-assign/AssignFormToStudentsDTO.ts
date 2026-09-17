import type {StudentDTO} from "@/shared/dtos/student/StudentDTO.ts";

export interface AssignFormToStudentsDTO {
    formUuid: string;
    students: StudentDTO[];
}
