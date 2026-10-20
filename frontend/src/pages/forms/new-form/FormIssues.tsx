import {useFormikContext, type FormikErrors} from "formik";
import {CircleAlert} from "lucide-react";
import type {FormCreateDTO} from "@/shared/dtos/form/FormCreateDTO.ts";
import {AnswerType} from "@/shared/models/enums/answer-type.ts";

interface Issue {
    label: string;
    targetId?: string;
}

function correctOptionIssue(type: AnswerType) {
    return type === AnswerType.MULTI_SELECT
        ? "marque ao menos uma opção correta"
        : "marque exatamente uma opção correta";
}

function collectIssues(errors: FormikErrors<FormCreateDTO>, values: FormCreateDTO): Issue[] {
    const issues: Issue[] = [];

    if (errors.title) issues.push({label: "Informe o título do formulário", targetId: "form-title"});
    if (errors.description) issues.push({label: "Informe a descrição do formulário", targetId: "form-description"});
    if (errors.limitDate) issues.push({label: "Defina uma data limite válida"});

    if (typeof errors.questions === "string") {
        issues.push({label: "Adicione ao menos uma questão"});
        return issues;
    }

    if (!Array.isArray(errors.questions)) return issues;

    errors.questions.forEach((questionErrors, index) => {
        if (!questionErrors || typeof questionErrors === "string") return;

        const number = index + 1;
        const targetId = `question-${index}`;
        const question = values.questions[index];

        if (questionErrors.question)
            issues.push({label: `Questão ${number}: informe o enunciado`, targetId});

        if (typeof questionErrors.options === "string")
            issues.push({label: `Questão ${number}: ${correctOptionIssue(question.answerType)}`, targetId});

        if (Array.isArray(questionErrors.options)) {
            questionErrors.options.forEach((optionErrors, optionIndex) => {
                if (optionErrors && typeof optionErrors !== "string" && optionErrors.optionText)
                    issues.push({
                        label: `Questão ${number}, opção ${optionIndex + 1}: informe o texto da opção`,
                        targetId
                    });
            });
        }
    });

    return issues;
}

const goTo = (targetId: string) => {
    const element = document.getElementById(targetId);
    element?.scrollIntoView({behavior: "smooth", block: "center"});
    element?.focus({preventScroll: true});
};

export default function FormIssues() {
    const {errors, values} = useFormikContext<FormCreateDTO>();
    const issues = collectIssues(errors, values);

    if (issues.length === 0) return null;

    return (
        <div
            role="status"
            className="flex flex-col w-8/10 gap-2 rounded-xl border border-warning/40 bg-warning/10 px-5 py-4
            text-warning-foreground"
        >
            <div className="flex items-center gap-2 font-semibold">
                <CircleAlert className="size-5"/>
                {issues.length === 1
                    ? "Falta 1 item para poder salvar o formulário"
                    : `Faltam ${issues.length} itens para poder salvar o formulário`}
            </div>
            <ul className="flex flex-col gap-1 pl-7 text-sm list-disc">
                {issues.map((issue) => (
                    <li key={issue.label}>
                        {issue.targetId
                            ? (
                                <button
                                    type="button"
                                    onClick={() => goTo(issue.targetId!)}
                                    className="text-left underline-offset-2 hover:underline hover:cursor-pointer"
                                >
                                    {issue.label}
                                </button>
                            )
                            : issue.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}
