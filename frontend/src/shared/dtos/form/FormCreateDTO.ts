import type {FormQuestionCreateDTO} from "@/shared/dtos/form-questions/FormQuestionCreateDTO.ts";

export interface FormCreateDTO {
    title: string,
    description: string,
    limitDate: string,
    questions: FormQuestionCreateDTO[]
}
