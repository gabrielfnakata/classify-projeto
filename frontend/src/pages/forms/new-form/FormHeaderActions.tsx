import {useFormikContext} from "formik";
import type {FormCreateDTO} from "@/shared/dtos/form/FormCreateDTO.ts";
import {useNavigate, useParams} from "react-router";
import {PageHeader} from "@/components/layout/page-header.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ArrowLeft, Download, Eye} from "lucide-react";
import LimitDateDialog from "@/components/dialogs/LimitDateDialog.tsx";
import {formatYMD} from "@/shared/utils/date-formatter.ts";
import AddQuestion from "@/pages/forms/new-form/AddQuestion.tsx";

interface FormHeaderActionsProps {
    type: "preview" | "create";
}

export default function FormHeaderActions({ type }: FormHeaderActionsProps) {
    const { values, isSubmitting, isValid, setFieldValue, submitForm } = useFormikContext<FormCreateDTO>();
    const navigate = useNavigate();
    const { id } = useParams();

    const navigateBack = () => {
        const backUrl = id ? '/posted-forms' : '/new-form'
        const state = id ? undefined : {form: values};
        navigate(backUrl, { state: state })
    }

    const buttonStyle = "h-10 px-5 rounded-xl text-sm font-semibold hover:cursor-pointer";
    const buttonVariant = "secondary";

    return (
        <div className="flex flex-row w-9/10 pt-6 sticky top-0 z-10 items-center justify-between bg-background">
            <PageHeader
                title="Novo Formulário"
                action={
                    <div className="flex flex-row gap-4">
                        <Button
                            variant={buttonVariant}
                            className={buttonStyle}
                            onClick={() => navigateBack()} disabled={isSubmitting}
                        >
                            <ArrowLeft /> Voltar
                        </Button>
                        { type === 'create' && (
                            <>
                                <AddQuestion buttonVariant={buttonVariant}/>
                                <LimitDateDialog
                                    initialDate={new Date(values.limitDate)}
                                    onDateChange={(date) => { setFieldValue("limitDate", formatYMD(date)) }}
                                    disabled={isSubmitting}
                                    buttonVariant={buttonVariant}
                                />
                                <Button
                                    className={buttonStyle + "hover:bg-button-highlight"}
                                    disabled={!isValid || isSubmitting}
                                    onClick={() => navigate('/form-preview', { state: { form: values } })}
                                >
                                    <Eye /> Ver Prévia
                                </Button>
                                <Button
                                    className={buttonStyle + "hover:bg-button-highlight"}
                                    disabled={!isValid || isSubmitting}
                                    onClick={submitForm}
                                >
                                    <Download /> Salvar Formulário
                                </Button>
                            </>
                        )}
                    </div>
                }
            />
        </div>
    );
}
