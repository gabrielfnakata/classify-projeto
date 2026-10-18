import { useFormikContext } from "formik";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/layout/page-header.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { ArrowLeft, ChevronLeft, ChevronRight, Save } from "lucide-react";
import type {FormCorrectionCreateDTO} from "@/shared/dtos/form-correction/FormCorrectionCreateDTO.ts";

interface CorrectFormHeaderActionsProps {
    formTitle: string;
    onPrevious: () => void;
    onNext: () => void;
    hasPrevious: boolean;
    hasNext: boolean;
    position?: string;
    studentName?: string;
}

export default function CorrectFormHeaderActions(
    { formTitle, onPrevious, onNext, hasPrevious, hasNext, position, studentName }: CorrectFormHeaderActionsProps
) {
    const { values, isSubmitting, isValid, dirty, setFieldValue, submitForm } = useFormikContext<FormCorrectionCreateDTO>();
    const navigate = useNavigate();

    const buttonStyle = "h-10 px-5 rounded-xl text-sm font-semibold hover:cursor-pointer";

    const withUnsavedChangesGuard = (action: () => void) => () => {
        if (dirty && !window.confirm("Você tem alterações não salvas nessa correção. Deseja sair mesmo assim?")) {
            return;
        }
        action();
    };

    return (
        <div className="flex flex-row w-9/10 pt-6 sticky top-0 z-10 items-center justify-between bg-background">
            <PageHeader
                title={`Corrigir: ${formTitle}`}
                action={
                    <div className="flex flex-col gap-4">
                    <div className="flex flex-row items-center gap-4">
                        <Button
                            variant="secondary"
                            className={buttonStyle}
                            onClick={withUnsavedChangesGuard(() => navigate(-1))}
                            disabled={isSubmitting}
                        >
                            <ArrowLeft /> Voltar
                        </Button>
                        <div className="flex items-center gap-2">
                            <Label>Nota:</Label>
                            <Input
                                type="number"
                                step="0.1"
                                min={0}
                                value={values.score}
                                onChange={(e) => setFieldValue("score", Number(e.target.value))}
                                className="w-20"
                                disabled={isSubmitting}
                            />
                        </div>
                        <Button
                            className={buttonStyle + " hover:bg-button-highlight"}
                            disabled={!isValid || isSubmitting}
                            onClick={submitForm}
                        >
                            <Save /> Salvar Correção
                        </Button>
                    </div>
                    <div className="flex flex-row justify-end gap-4">

                        <div className="flex items-center gap-1">
                            <Button
                                variant="secondary"
                                className="h-10 w-10 p-0 rounded-xl hover:cursor-pointer"
                                onClick={withUnsavedChangesGuard(onPrevious)}
                                disabled={!hasPrevious || isSubmitting}
                            >
                                <ChevronLeft />
                            </Button>
                            {position && (
                                <Label className="text-muted-foreground text-sm px-1 whitespace-nowrap">
                                    Aluno: {studentName}
                                </Label>
                            )}
                            <Button
                                variant="secondary"
                                className="h-10 w-10 p-0 rounded-xl hover:cursor-pointer"
                                onClick={withUnsavedChangesGuard(onNext)}
                                disabled={!hasNext || isSubmitting}
                            >
                                <ChevronRight />
                            </Button>
                        </div>
                    </div>
                </div>
                }
            />
        </div>
    );
}
