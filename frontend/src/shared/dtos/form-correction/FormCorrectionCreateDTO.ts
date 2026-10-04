import type { FormFeedbackCreateDTO } from "./FormFeedbackCreateDTO";

export interface FormCorrectionCreateDTO {
    formSubmissionUuid: string;
    formFeedbacks: FormFeedbackCreateDTO[];
    score: number;
}
