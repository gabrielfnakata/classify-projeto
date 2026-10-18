import type {FormStatus} from "@/shared/models/enums/form-status.ts";
import type { FormAnswerDTO } from "../form-answer/FormAnswerDTO";

export interface FormSubmissionDTO {
    uuid: string;
    formUuid: string;
    formTitle: string;
    studentUuid: string;
    studentName: string;
    answers: FormAnswerDTO[];
    status: FormStatus;
    startedAt: Date;
    submittedAt: Date;
    correctedAt: Date;
    score: number;
}
