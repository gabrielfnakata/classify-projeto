import { useLocation, useNavigate } from "react-router";
import { useMemo } from "react";
import { Formik } from "formik";
import { Ghost } from "lucide-react";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";
import useFetch from "@/hooks/useFetch.tsx";
import api from "@/services/api";
import { isObjectiveType, isObjectiveAnswerCorrect } from "@/shared/utils/form-correction-helpers.ts";
import type { FormSubmissionDTO } from "@/shared/dtos/form-submission/FormSubmissionDTO.ts";
import type { FormAnswerDTO } from "@/shared/dtos/form-answer/FormAnswerDTO.ts";
import type { FormInfoDTO } from "@/shared/dtos/form/FormInfoDTO.ts";
import type { FormCorrectionCreateDTO } from "@/shared/dtos/form-correction/FormCorrectionCreateDTO.ts";
import { CorrectFormValidationSchema } from "@/validation/FormCorrectionSchema";
import CorrectFormHeaderActions from "./form-correction/FormCorrectionHeaderActions";
import QuestionList from "@/pages/forms/form-correction/QuestionList.tsx";

const groupAnswersByQuestion = (answers: FormAnswerDTO[] = []) => {
    const map = new Map<string, FormAnswerDTO[]>();
    answers.forEach((answer) => {
        map.set(answer.questionUuid, [...(map.get(answer.questionUuid) ?? []), answer]);
    });
    return map;
};

const buildInitialValues = (
    submission: FormSubmissionDTO,
    form: FormInfoDTO,
    answersByQuestion: Map<string, FormAnswerDTO[]>
): FormCorrectionCreateDTO => ({
    formSubmissionUuid: submission.uuid,
    score: submission.score ?? 0,
    formFeedbacks: (form.questions ?? []).map((question) => {
        const answers = answersByQuestion.get(question.uuid) ?? [];
        return {
            questionUuid: question.uuid,
            teacherFeedback: answers[0]?.teacherFeedback ?? "",
            correct: isObjectiveType(question.answerType)
                ? isObjectiveAnswerCorrect(question.options ?? [], answers)
                : answers[0]?.correct ?? false,
        };
    }),
});

export default function CorrectForm() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const submission = state?.submission as FormSubmissionDTO | undefined;
    const submissions = (state?.submissions as FormSubmissionDTO[] | undefined) ?? [];

    const { data: form } = useFetch<FormInfoDTO>(submission ? `/form/${submission.formUuid}` : null);

    const answersByQuestion = useMemo(
        () => groupAnswersByQuestion(submission?.answers),
        [submission]
    );

    const initialValues = useMemo<FormCorrectionCreateDTO>(
        () =>
            submission && form
                ? buildInitialValues(submission, form, answersByQuestion)
                : { formSubmissionUuid: "", score: 0, formFeedbacks: [] },
        [submission, form, answersByQuestion]
    );

    const currentIndex = submissions.findIndex((s) => s.studentUuid === submission?.studentUuid);
    const hasIndex = currentIndex >= 0;
    const previous = hasIndex ? submissions[currentIndex - 1] : undefined;
    const next = hasIndex ? submissions[currentIndex + 1] : undefined;

    const goTo = (target?: FormSubmissionDTO) => {
        if (!target) return;
        navigate(`/form-answers/${target.formUuid}/${target.studentUuid}`, {
            state: { submission: target, submissions },
            replace: true,
        });
    };

    const handleSubmit = async (values: FormCorrectionCreateDTO) => {
        await api.post("/form/form-correction", values);
        alert("Correção salva com sucesso");
        navigate(-1);
    };

    if (!submission) {
        return (
            <div className="flex flex-col w-full h-full items-center justify-center gap-4">
                <Label className="text-muted-foreground">Não foi possível carregar essa submissão.</Label>
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
                        studentName={submission.studentName}
                        onPrevious={() => goTo(previous)}
                        onNext={() => goTo(next)}
                        hasPrevious={!!previous}
                        hasNext={!!next}
                        position={hasIndex ? `${currentIndex + 1} de ${submissions.length}` : undefined}
                    />

                    <div className="flex flex-col w-8/10 gap-12 mb-8 items-start justify-center">
                        <Label className="w-full h-24 border-b-2 px-4 border-table-foreground text-4xl font-bold text-foreground">
                            {form.title}
                        </Label>
                        <Label className="w-full px-4 text-xl text-muted-foreground font-bold">
                            {form.description}
                        </Label>
                    </div>

                    {form.questions?.length ? (
                        <QuestionList questions={form.questions} answers={answersByQuestion} />
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
        </Formik>
    );
}
