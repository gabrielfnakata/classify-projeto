import * as yup from "yup";

export const CorrectFormValidationSchema = yup.object({
    score: yup
        .number()
        .min(0, "A nota não pode ser negativa")
        .required("Informe a nota"),
    feedbacks: yup.lazy((obj: Record<string, unknown>) =>
        yup.object(
            Object.keys(obj ?? {}).reduce((shape, questionUuid) => {
                shape[questionUuid] = yup.object({
                    teacherFeedback: yup.string().default(""),
                    correct: yup.boolean().required(),
                });
                return shape;
            }, {} as Record<string, yup.AnySchema>)
        )
    ),
});
