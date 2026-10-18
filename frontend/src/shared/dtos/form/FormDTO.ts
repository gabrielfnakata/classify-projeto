import type {FormStatus} from "@/shared/models/enums/form-status";

export interface FormDTO {
    uuid: string;
    title: string;
    description: string;
    teacherName: string;
    questions: number;
    createdAt: string;
    limitDate: string;
    hasScore: boolean;
    score: number | null;
    status: FormStatus;
}
