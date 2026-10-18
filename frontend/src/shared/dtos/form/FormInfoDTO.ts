import type {FormQuestionDTO} from "@/shared/dtos/form-questions/FormQuestionDTO.ts";

export interface FormInfoDTO {
    title: string,
    description: string,
    questions: FormQuestionDTO[]
}
