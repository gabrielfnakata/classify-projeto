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
    if (answers.length === 0) return false;

    const selectedUuids = new Set(
        answers.map((a) => a.optionUuid).filter((uuid): uuid is string => uuid !== undefined)
    );
    const correctUuids = new Set(options.filter((o) => o.correct).map((o) => o.uuid));

    if (selectedUuids.size !== correctUuids.size) return false;
    for (const uuid of selectedUuids) {
        if (!correctUuids.has(uuid)) return false;
    }
    return true;
}
