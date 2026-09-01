import {useFormikContext} from "formik";
import {useNavigate} from "react-router";
import {PageHeader} from "@/components/layout/page-header.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ArrowLeft, Save, Send} from "lucide-react";
import type {AnswerFormValues} from "@/pages/forms/AnswerForm.tsx";

interface AnswerHeaderActionsProps {
    hasQuestions: boolean;
    onSaveDraft: (values: AnswerFormValues) => void;
}

export default function AnswerHeaderActions({ hasQuestions, onSaveDraft }: AnswerHeaderActionsProps) {
    const { values, isSubmitting, submitForm } = useFormikContext<AnswerFormValues>();
    const navigate = useNavigate();

    const secondaryStyle = "h-10 px-5 rounded-xl text-sm font-semibold hover:cursor-pointer";
    const primaryStyle = "h-10 px-5 bg-button-background rounded-xl text-sm font-semibold hover:bg-button-highlight hover:cursor-pointer";

    return (
        <div className="flex flex-row w-9/10 items-center justify-between">
            <PageHeader
                title="Responder Formulário"
                action={
                    <div className="flex flex-row gap-4">
                        <Button
                            variant="secondary"
                            className={secondaryStyle}
                            onClick={() => navigate('/pending-forms')}
                            disabled={isSubmitting}
                        >
                            <ArrowLeft /> Voltar
                        </Button>
                        <Button
                            variant="secondary"
                            className={secondaryStyle}
                            disabled={!hasQuestions || isSubmitting}
                            onClick={() => onSaveDraft(values)}
                        >
                            <Save /> Salvar Resposta
                        </Button>
                        <Button
                            className={primaryStyle}
                            disabled={!hasQuestions || isSubmitting}
                            onClick={submitForm}
                        >
                            <Send /> Enviar Formulário
                        </Button>
                    </div>
                }
            />
        </div>
    );
}
