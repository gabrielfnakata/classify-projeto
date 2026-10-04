import type {FormikErrors} from "formik";
import {AnswerType} from "@/shared/models/enums/answer-type.ts";
import type {FormQuestionDTO} from "@/shared/dtos/form-questions/FormQuestionDTO.ts";
import type {AnswerFormValues, QuestionAnswerValue} from "@/shared/models/forms/SubmissionFormState.ts";

const isAnswered = (type: AnswerType, answer: QuestionAnswerValue) => {
    switch (type) {
        case AnswerType.TEXT:
            return answer.answerText.trim().length > 0;
        case AnswerType.SELECT:
            return answer.optionUuid !== "";
        case AnswerType.MULTI_SELECT:
            return answer.optionUuids.length > 0;
        case AnswerType.IMAGE:
        case AnswerType.FILE:
            return answer.files.some((file) => file.status === "done");
    }
};

const getAnswerError = (question: FormQuestionDTO, answer: QuestionAnswerValue): string | undefined => {
    if (answer.files.some((file) => file.status === "uploading")) {
        return "Aguarde o envio dos arquivos";
    }
    if (answer.files.some((file) => file.status === "error")) {
        return "Remova os arquivos com falha antes de enviar";
    }
    if (question.isRequired && !isAnswered(question.answerType, answer)) {
        return "Esta questão é obrigatória";
    }
};

export const buildSubmissionValidator = (questions: FormQuestionDTO[]) =>
    (values: AnswerFormValues): FormikErrors<AnswerFormValues> => {
        const answers: string[] = [];
        questions.forEach((question, index) => {
            const message = values.answers[index] && getAnswerError(question, values.answers[index]);
            if (message) answers[index] = message;
        });
        return answers.length > 0 ? { answers } : {};
    };
