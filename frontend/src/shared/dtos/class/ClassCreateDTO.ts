import type { StudentCreateDTO } from "../student/StudentCreateDTO";

export interface ClassCreateDTO {
    name: string;
    description: string;
    members: StudentCreateDTO[];
}
