import TextareaAutosize from "react-textarea-autosize";
import {AnswerType} from "@/shared/models/enums/answer-type.ts";
import type {FormQuestionOptionDTO} from "@/shared/dtos/form-question-options/FormQuestionOptionDTO.ts";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx";
import {Label} from "@/components/ui/label.tsx";
import FileAnswerField from "@/pages/forms/submission-form/FileAnswerField.tsx";
import type {QuestionAnswerValue} from "@/shared/models/forms/SubmissionFormState.ts";

interface QuestionAnswerProps {
    type: AnswerType;
    options: FormQuestionOptionDTO[];
    value: QuestionAnswerValue;
    onChange: (updater: (previous: QuestionAnswerValue) => QuestionAnswerValue) => void;
}

export default function QuestionAnswer({ type, options, value, onChange }: QuestionAnswerProps) {
    if (type === AnswerType.TEXT) {
        return (
            <TextareaAutosize
                placeholder="Digite sua resposta..."
                className="
                flex min-h-8 w-full rounded-lg border border-border bg-white p-4 text-base transition-colors
                outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3
                focus-visible:ring-ring/50 md:text-sm resize-none
                "
                value={value.answerText}
                onChange={(e) => onChange((previous) => ({ ...previous, answerText: e.target.value }))}
            />
        );
    }

    if (type === AnswerType.IMAGE || type === AnswerType.FILE) {
        return <FileAnswerField type={type} files={value.files} onChange={onChange} />;
    }

    const onToggleOption = (optionUuid: string) =>
        onChange((previous) => ({
            ...previous,
            optionUuids: previous.optionUuids.includes(optionUuid)
                ? previous.optionUuids.filter((uuid) => uuid !== optionUuid)
                : [...previous.optionUuids, optionUuid]
        }));

    const renderIndicator = (option: FormQuestionOptionDTO) => {
        if (type === AnswerType.MULTI_SELECT) {
            return (
                <Checkbox
                    id={option.uuid}
                    checked={value.optionUuids.includes(option.uuid)}
                    onCheckedChange={() => onToggleOption(option.uuid)}
                    className="bg-white text-black hover:outline-2 hover:outline-solid hover:outline-ring transition-colors"
                />
            );
        }
        return (
            <RadioGroupItem
                id={option.uuid}
                value={option.uuid}
                className="bg-white text-black hover:outline-2 hover:outline-solid hover:outline-ring transition-colors"
            />
        );
    };

    const optionsList = options.map((option) => (
        <div key={option.uuid} className="flex justify-start items-center gap-2 pl-4">
            {renderIndicator(option)}
            <Label
                htmlFor={option.uuid}
                className="w-1/2 min-h-6 pl-4 text-md text-foreground hover:cursor-pointer"
            >
                {option.optionText}
            </Label>
        </div>
    ));

    return type === AnswerType.MULTI_SELECT
        ? <div className="flex flex-col gap-2">{optionsList}</div>
        : (
            <RadioGroup
                value={value.optionUuid}
                onValueChange={(optionUuid) => onChange((previous) => ({ ...previous, optionUuid }))}
            >
                {optionsList}
            </RadioGroup>
        );
}
