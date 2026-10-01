import { AnswerType } from "@/shared/models/enums/answer-type.ts";
import type { FormQuestionOptionDTO } from "@/shared/dtos/form-question-options/FormQuestionOptionDTO.ts";
import type { FormAnswerDTO } from "@/shared/dtos/form-answer/FormAnswerDTO.ts";

export function isObjectiveType(type: AnswerType) {
    return type === AnswerType.SELECT || type === AnswerType.MULTI_SELECT;
}

export function isObjectiveAnswerCorrect(
    options: FormQuestionOptionDTO[],
    answers: FormAnswerDTO[]
): boolean {
    const selected = new Set(
        answers.map(a => a.optionUuid).filter((uuid): uuid is string => !!uuid)
    );
    const correct = new Set(options.filter(o => o.correct).map(o => o.uuid));

    return correct.size === selected.size && [...correct].every(uuid => selected.has(uuid));
}
