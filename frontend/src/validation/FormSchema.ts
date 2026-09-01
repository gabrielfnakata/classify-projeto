import * as yup from "yup";
import {AnswerType} from "@/shared/models/enums/answer-type.ts";

export const FormValidationSchema = yup.object({
    title: yup.string().required("O título do formulário é obrigatório."),
    description: yup.string().required("A descrição do formulário é obrigatória."),
    limitDate: yup.string().required("A data limite é obrigatória")
        .matches(/^\d{4}-\d{2}-\d{2}$/, "A data deve estar no formato yyyy-MM-dd")
        .test(
            "valid-date",
            "A data informada não é válida",
            (value) => {
                if (!value) return false;
                const date = new Date(value);
                return !isNaN(date.getTime()) && value === date.toISOString().slice(0, 10);
            }
        ),
    questions: yup.array()
        .of(
            yup.object({
            question: yup.string().required("O título da questão é obrigatório"),
            answerType: yup.string().required("O tipo da questão é obrigatório")
                .oneOf(Object.values(AnswerType), "A questão deve ser de um dos tipos predefinidos"),
            options: yup.array()
                .when("answerType", {
                    is: (val: AnswerType) => val === AnswerType.SELECT || val === AnswerType.MULTI_SELECT,
                    then: (schema) => schema
                        .of(
                            yup.object({
                                optionText: yup.string().required("O texto da opção é obrigatório"),
                                isCorrect: yup.boolean().required("O valor de correto da opção é obrigatório")
                            })
                        ).test(
                            "correct-options-count",
                            "Quantidade de opções corretas inválida para o tipo de questão",
                            function (options) {
                                if (!options) return false;
                                const correctCount = options.filter((opt) => opt.isCorrect).length;
                                const answerType = this.parent.answerType;

                                if (answerType === AnswerType.SELECT) return correctCount === 1;
                                if (answerType === AnswerType.MULTI_SELECT) return correctCount >= 1;

                                return true;
                            }
                        )
                    ,
                    otherwise: (schema) => schema.strip()
                })
        })
    ).min(1, "É obrigatório ter ao menos uma questão")
    .required("A lista de questões é obrigatória")
});

