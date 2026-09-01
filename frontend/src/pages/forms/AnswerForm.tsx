import {useNavigate, useParams} from "react-router";
import {Formik, type FormikHelpers} from "formik";
import useFetch from "@/hooks/useFetch.tsx";
import api from "@/services/api.ts";
import type {FormInfoDTO} from "@/shared/dtos/form/FormInfoDTO.ts";
import type {FormSubmissionCreateDTO} from "@/shared/dtos/form-submissions/FormSubmissionCreateDTO.ts";
import type {FormAnswerCreateDTO} from "@/shared/dtos/form-answers/FormAnswerCreateDTO.ts";
import type {FormQuestionDTO} from "@/shared/dtos/form-questions/FormQuestionDTO.ts";
import {AnswerType} from "@/shared/models/enums/answer-type.ts";
import AnswerHeaderActions from "@/pages/forms/submission-form/AnswerHeaderActions.tsx";
import AnswerHeaderFields from "@/pages/forms/submission-form/AnswerHeaderFields.tsx";
import QuestionList from "@/pages/forms/submission-form/QuestionList.tsx";
import type {QuestionAnswerValue} from "@/pages/forms/submission-form/QuestionAnswer.tsx";

export interface AnswerFormValues {
    answers: QuestionAnswerValue[];
}

const draftKey = (uuid: string) => `answer-draft-${uuid}`;

function loadDraft(uuid?: string): QuestionAnswerValue[] | null {
    if (!uuid) return null;
    try {
        const raw = localStorage.getItem(draftKey(uuid));
        return raw ? JSON.parse(raw) as QuestionAnswerValue[] : null;
    } catch {
        return null;
    }
}

function buildAnswers(question: FormQuestionDTO, answer: QuestionAnswerValue): FormAnswerCreateDTO[] {
    switch (question.answerType) {
        case AnswerType.TEXT:
            return [{ questionUuid: question.uuid, answerText: answer.answerText }];
        case AnswerType.MULTI_SELECT:
            return answer.optionUuids.map((optionUuid) => ({ questionUuid: question.uuid, optionUuid }));
        case AnswerType.SELECT:
            return answer.optionUuid ? [{ questionUuid: question.uuid, optionUuid: answer.optionUuid }] : [];
    }
}

export default function SubmissionForm() {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const { data: form } = useFetch<FormInfoDTO>(uuid ? `/form/${uuid}` : null);
    const questions = form?.questions ?? [];

    const blankAnswers = () => questions.map(() => ({ answerText: "", optionUuid: "", optionUuids: [] }));
    const draft = loadDraft(uuid);

    const initialValues: AnswerFormValues = {
        answers: draft && draft.length === questions.length ? draft : blankAnswers()
    };

    const handleSaveDraft = (values: AnswerFormValues) => {
        if (!uuid) return;
        localStorage.setItem(draftKey(uuid), JSON.stringify(values.answers));
        alert('Resposta salva. Você pode continuar depois de onde parou.');
    };

    const handleSubmit = async (values: AnswerFormValues, helpers: FormikHelpers<AnswerFormValues>) => {
        helpers.setSubmitting(true);
        const payload: FormSubmissionCreateDTO = {
            formId: uuid ?? '',
            answers: questions.flatMap((question, index) => buildAnswers(question, values.answers[index]))
        };
        await api.put(`/form/submit-form/${uuid}`, payload);
        if (uuid) localStorage.removeItem(draftKey(uuid));
        alert('Formulário enviado com sucesso');
        navigate('/pending-forms');
        helpers.setSubmitting(false);
    };

    return (
        <Formik initialValues={initialValues} enableReinitialize onSubmit={handleSubmit}>
            <div className="flex flex-col background h-full w-full items-center justify-center">
                <div className="flex flex-col w-full h-full py-23 gap-[2vh] justify-start items-center">
                    <AnswerHeaderActions hasQuestions={questions.length > 0} onSaveDraft={handleSaveDraft} />
                    <AnswerHeaderFields title={form?.title} description={form?.description} />
                    <QuestionList questions={questions} />
                </div>
            </div>
        </Formik>
    );
}
