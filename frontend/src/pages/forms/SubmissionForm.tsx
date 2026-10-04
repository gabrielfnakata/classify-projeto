import {useEffect, useMemo, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {Formik} from "formik";
import useFetch from "@/hooks/useFetch.tsx";
import api from "@/services/api.ts";
import type {FormInfoDTO} from "@/shared/dtos/form/FormInfoDTO.ts";
import type {FormQuestionDTO} from "@/shared/dtos/form-questions/FormQuestionDTO.ts";
import type {FormSubmissionCreateDTO} from "@/shared/dtos/form-submissions/FormSubmissionCreateDTO.ts";
import type {FormSubmissionAnswerDTO} from "@/shared/dtos/form-submissions/FormSubmissionAnswerDTO.ts";
import {AnswerType} from "@/shared/models/enums/answer-type.ts";
import {buildSubmissionValidator} from "@/validation/SubmissionValidation.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog.tsx";
import AnswerHeaderActions from "@/pages/forms/submission-form/AnswerHeaderActions.tsx";
import AnswerHeaderFields from "@/pages/forms/submission-form/AnswerHeaderFields.tsx";
import QuestionList from "@/pages/forms/submission-form/QuestionList.tsx";
import {emptyAnswer, type AnswerFormValues, type QuestionAnswerValue} from "@/shared/models/forms/SubmissionFormState.ts";

interface DialogState {
    message: string;
    redirect?: boolean;
}

const draftKey = (submissionUuid: string) => `answer-draft-${submissionUuid}`;

type Draft = Record<string, QuestionAnswerValue>;

function loadDraft(submissionUuid?: string): Draft | null {
    if (!submissionUuid) return null;
    try {
        const raw = localStorage.getItem(draftKey(submissionUuid));
        const draft = raw ? JSON.parse(raw) : null;
        return draft && !Array.isArray(draft) ? draft as Draft : null;
    } catch {
        return null;
    }
}

function buildAnswers(question: FormQuestionDTO, answer: QuestionAnswerValue): FormSubmissionAnswerDTO[] {
    switch (question.answerType) {
        case AnswerType.TEXT:
            return [{ questionUuid: question.uuid, answerText: answer.answerText }];
        case AnswerType.MULTI_SELECT:
            return answer.optionUuids.map((optionUuid) => ({ questionUuid: question.uuid, optionUuid }));
        case AnswerType.SELECT:
            return answer.optionUuid ? [{ questionUuid: question.uuid, optionUuid: answer.optionUuid }] : [];
        case AnswerType.IMAGE:
        case AnswerType.FILE: {
            const answerFiles = answer.files
                .filter((file) => file.status === "done")
                .map(({ uuid, fileName }) => ({ uuid, fileName }));
            return answerFiles.length > 0 ? [{ questionUuid: question.uuid, answerFiles }] : [];
        }
    }
}

export default function SubmissionForm() {
    const { formUuid, submissionUuid } = useParams();
    const navigate = useNavigate();
    const { data: form, error } = useFetch<FormInfoDTO>(formUuid ? `/form/${formUuid}` : null);
    const [dialog, setDialog] = useState<DialogState | null>(null);

    const questions = useMemo(() => form?.questions ?? [], [form]);
    const draft = useMemo(() => loadDraft(submissionUuid), [submissionUuid]);
    const validate = useMemo(() => buildSubmissionValidator(questions), [questions]);

    const initialValues = useMemo<AnswerFormValues>(() => ({
        answers: questions.map((question) => ({ ...emptyAnswer(), ...draft?.[question.uuid] }))
    }), [draft, questions]);

    useEffect(() => {
        if (submissionUuid && !draft) {
            api.put(`/form/submission-start/${submissionUuid}`, {}).catch(() => undefined);
        }
    }, [submissionUuid, draft]);

    const handleSaveDraft = (values: AnswerFormValues) => {
        if (!submissionUuid) return;
        const draftToSave: Draft = Object.fromEntries(
            questions.map((question, index) => [
                question.uuid,
                { ...values.answers[index], files: values.answers[index].files.filter((file) => file.status === "done") }
            ])
        );
        localStorage.setItem(draftKey(submissionUuid), JSON.stringify(draftToSave));
        setDialog({ message: "A resposta foi salva. Você pode continuar de onde parou." });
    };

    const handleSubmit = async (values: AnswerFormValues) => {
        const payload: FormSubmissionCreateDTO = {
            formId: formUuid ?? '',
            answers: questions.flatMap((question, index) => buildAnswers(question, values.answers[index]))
        };
        try {
            await api.put(`/form/submit-form/${submissionUuid}`, payload);
            if (submissionUuid) localStorage.removeItem(draftKey(submissionUuid));
            setDialog({ message: "O formulário foi enviado com sucesso.", redirect: true });
        } catch {
            setDialog({ message: "Não foi possível enviar o formulário. Tente novamente." });
        }
    };

    const renderContent = () => {
        if (error) {
            return <p className="mt-24 text-foreground opacity-50">Não foi possível carregar o formulário.</p>;
        }
        if (!form) {
            return (
                <div className="flex flex-col gap-10 w-8/10">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="w-full h-48 rounded-[22px] p-6"/>
                    ))}
                </div>
            );
        }
        return (
            <>
                <AnswerHeaderFields title={form.title} description={form.description} />
                <QuestionList questions={questions} />
            </>
        );
    };

    return (
        <Formik
            initialValues={initialValues}
            validate={validate}
            validateOnMount={false}
            enableReinitialize
            onSubmit={handleSubmit}
        >
            <div className="flex flex-col background h-full w-full items-center justify-center">
                <div className="flex flex-col w-full h-full py-17 gap-[2vh] justify-start items-center">
                    <AnswerHeaderActions hasQuestions={questions.length > 0} onSaveDraft={handleSaveDraft} />
                    {renderContent()}
                </div>
                <ConfirmationDialog
                    open={dialog !== null}
                    onOpenChange={(open) => {
                        if (open) return;
                        if (dialog?.redirect) navigate("/pending-forms");
                        setDialog(null);
                    }}
                    message={dialog?.message ?? ""}
                />
            </div>
        </Formik>
    );
}
