import {useLocation, useNavigate} from "react-router";
import { useMemo } from "react";
import { Formik, type FormikHelpers } from "formik";
import { Ghost } from "lucide-react";
import { ContentCard } from "@/components/layout/content-card.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";
import useFetch from "@/hooks/useFetch.tsx";
import api from "@/services/api";
import { isObjectiveType, isObjectiveAnswerCorrect } from "@/shared/utils/form-correction-helpers.ts";
import type { FormSubmissionDTO } from "@/shared/dtos/form-submission/FormSubmissionDTO.ts";
import type { FormAnswerDTO } from "@/shared/dtos/form-answer/FormAnswerDTO.ts";
import type { FormInfoDTO } from "@/shared/dtos/form/FormInfoDTO.ts";
import type { FormFeedbackCreateDTO } from "@/shared/dtos/form-correction/FormFeedbackCreateDTO.ts";
import type { FormCorrectionCreateDTO } from "@/shared/dtos/form-correction/FormCorrectionCreateDTO.ts";
import { CorrectFormValidationSchema } from "@/validation/FormCorrectionSchema";
import CorrectFormHeaderActions from "./form-correction/FormCorrectionHeaderActions";
import QuestionCorrection from "./form-correction/QuestionCorrection";

export interface QuestionFeedbackValues {
    teacherFeedback: string;
    correct: boolean;
}

export interface CorrectionFormValues {
    score: number;
    feedbacks: Record<string, QuestionFeedbackValues>;
}

export default function CorrectForm() {
    const location = useLocation();
    const navigate = useNavigate();

    const submission = location.state?.submission as FormSubmissionDTO | undefined;
    const submissions = (location.state?.submissions as FormSubmissionDTO[] | undefined) ?? [];

    const { data: form } = useFetch<FormInfoDTO>(
        submission ? `/form/${submission.formUuid}` : null
    );

    const currentIndex = submission
        ? submissions.findIndex((s) => s.studentUuid === submission.studentUuid)
        : -1;
    const previousSubmission = currentIndex > 0 ? submissions[currentIndex - 1] : undefined;
    const nextSubmission =
        currentIndex !== -1 && currentIndex < submissions.length - 1
            ? submissions[currentIndex + 1]
            : undefined;

    const goToSubmission = (target?: FormSubmissionDTO) => {
        if (!target) return;
        navigate(`/form-answers/${target.formUuid}/${target.studentUuid}`, {
            state: { submission: target, submissions },
            replace: true,
        });
    };

    const answersByQuestion = useMemo(() => {
        const map = new Map<string, FormAnswerDTO[]>();
        submission?.answers.forEach((answer) => {
            const list = map.get(answer.questionUuid) ?? [];
            list.push(answer);
            map.set(answer.questionUuid, list);
        });
        return map;
    }, [submission]);

    const initialValues: CorrectionFormValues = useMemo(() => {
        if (!submission || !form?.questions) return { score: 0, feedbacks: {} };

        const feedbacks: CorrectionFormValues["feedbacks"] = {};
        form.questions.forEach((question) => {
            const answers = answersByQuestion.get(question.uuid) ?? [];
            feedbacks[question.uuid] = {
                teacherFeedback: answers[0]?.teacherFeedback ?? "",
                correct: isObjectiveType(question.answerType)
                    ? isObjectiveAnswerCorrect(question.options ?? [], answers)
                    : answers[0]?.correct ?? false,
            };
        });

        return { score: submission.score ?? 0, feedbacks };
    }, [submission, form, answersByQuestion]);

    const handleSubmit = async (values: CorrectionFormValues, helpers: FormikHelpers<CorrectionFormValues>) => {
        if (!submission || !form?.questions) return;
        helpers.setSubmitting(true);
        try {
            const formFeedbacks: FormFeedbackCreateDTO[] = form.questions.map((question) => {
                const answers = answersByQuestion.get(question.uuid) ?? [];
                const correct = isObjectiveType(question.answerType)
                    ? isObjectiveAnswerCorrect(question.options ?? [], answers)
                    : values.feedbacks[question.uuid]?.correct ?? false;

                return {
                    questionUuid: question.uuid,
                    teacherFeedback: values.feedbacks[question.uuid]?.teacherFeedback ?? "",
                    correct,
                };
            });

            const payload: FormCorrectionCreateDTO = {
                formSubmissionUuid: submission.uuid,
                formFeedbacks,
                score: values.score,
            };

            await api.post("/form-correction", payload);
            alert("Correção salva com sucesso");
            navigate(-1);
        } finally {
            helpers.setSubmitting(false);
        }
    };

    if (!submission) {
        return (
            <div className="flex flex-col w-full h-full items-center justify-center gap-4">
                <Label className="text-muted-foreground">
                    Não foi possível carregar essa submissão.
                </Label>
                <Button variant="secondary" onClick={() => navigate(-1)}>Voltar</Button>
            </div>
        );
    }

    if (!form) {
        return (
            <div className="flex w-full h-full items-center justify-center">
                <Label className="text-muted-foreground">Carregando...</Label>
            </div>
        );
    }

    return (
        <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={CorrectFormValidationSchema}
            onSubmit={handleSubmit}
        >
            <div className="flex flex-col background h-full w-full items-center justify-center">
                <div className="flex flex-col w-full h-full py-23 gap-[2vh] justify-start items-center">
                    <CorrectFormHeaderActions
                        formTitle={form.title}
                        onPrevious={() => goToSubmission(previousSubmission)}
                        onNext={() => goToSubmission(nextSubmission)}
                        hasPrevious={!!previousSubmission}
                        hasNext={!!nextSubmission}
                        position={currentIndex !== -1 ? `${currentIndex + 1} de ${submissions.length}` : undefined}
                        studentName={submission.studentName}
                    />

                    <div className="flex flex-col w-8/10 gap-12 mb-8 items-start justify-center">
                        <div className="flex flex-row w-full items-center">
                            <Label className="w-full h-24 border-b-2 px-4 border-table-foreground text-4xl font-bold text-foreground">
                                {form.title}
                            </Label>
                        </div>
                        <div className="flex flex-row w-full justify-start items-center">
                            <Label className="w-full px-4 text-xl text-muted-foreground font-bold">
                                {form.description}
                            </Label>
                        </div>
                    </div>

                    <div className="flex flex-col gap-10 w-8/10">
                        {form.questions && form.questions.length > 0 ? (
                            form.questions.map((question, index) => (
                                <ContentCard key={index} className="flex flex-col w-full gap-8">
                                    <div className="flex w-full">
                                        <Label className="w-full h-16 px-2 text-2xl font-bold text-foreground">
                                            {question.question} {question.isRequired ? "*" : ""}
                                        </Label>
                                    </div>
                                    <QuestionCorrection
                                        questionUuid={question.uuid}
                                        type={question.answerType}
                                        options={question.options ?? []}
                                        answers={answersByQuestion.get(question.uuid) ?? []}
                                    />
                                </ContentCard>
                            ))
                        ) : (
                            <div className="flex flex-col justify-center items-center w-full mt-24 gap-8">
                                <Ghost className="scale-200 text-foreground opacity-50" />
                                <Label className="text-foreground text-center opacity-50">
                                    Não há questões nesse formulário
                                </Label>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Formik>
    );
}
