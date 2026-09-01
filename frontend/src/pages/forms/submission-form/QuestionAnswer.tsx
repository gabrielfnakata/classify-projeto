import {AnswerType} from "@/shared/models/enums/answer-type.ts";
import type {FormQuestionOptionDTO} from "@/shared/dtos/form-question-options/FormQuestionOptionDTO.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx";
import {Label} from "@/components/ui/label.tsx";

export interface QuestionAnswerValue {
    answerText: string;
    optionUuid: string;
    optionUuids: string[];
}

interface QuestionAnswerProps {
    type: AnswerType;
    options: FormQuestionOptionDTO[];
    value: QuestionAnswerValue;
    onChange: (value: QuestionAnswerValue) => void;
}

export default function QuestionAnswer({ type, options, value, onChange }: QuestionAnswerProps) {
    if (type === AnswerType.TEXT) {
        return (
            <Textarea
                placeholder="Digite sua resposta..."
                className="border-border h-8 p-4 placeholder:text-muted-foreground bg-white"
                value={value.answerText}
                onChange={(e) => onChange({ ...value, answerText: e.target.value })}
            />
        );
    }

    const onToggleOption = (optionUuid: string) => {
        const optionUuids = value.optionUuids.includes(optionUuid)
            ? value.optionUuids.filter((uuid) => uuid !== optionUuid)
            : [...value.optionUuids, optionUuid];
        onChange({ ...value, optionUuids });
    };

    const renderIndicator = (option: FormQuestionOptionDTO) => {
        if (type === AnswerType.MULTI_SELECT) {
            return (
                <Checkbox
                    checked={value.optionUuids.includes(option.uuid)}
                    onCheckedChange={() => onToggleOption(option.uuid)}
                    className="bg-white text-black hover:outline-2 hover:outline-solid hover:outline-ring transition-colors"
                />
            );
        }
        return (
            <RadioGroupItem
                value={option.uuid}
                className="bg-white text-black hover:outline-2 hover:outline-solid hover:outline-ring transition-colors"
            />
        );
    };

    const optionsList = options.map((option) => (
        <div key={option.uuid} className="flex justify-start items-center gap-2 pl-4">
            {renderIndicator(option)}
            <Label
                className="w-1/2 h-6 pl-4 text-md text-foreground
                placeholder:text-muted-foreground focus:outline-none"
            >
                {option.optionText}
            </Label>
        </div>
    ));

    return (
        <>
            {
                type === AnswerType.MULTI_SELECT
                    ? <div className="flex flex-col gap-2">{optionsList}</div>
                    : (
                        <RadioGroup
                            value={value.optionUuid}
                            onValueChange={(optionUuid) => onChange({ ...value, optionUuid })}
                        >
                            {optionsList}
                        </RadioGroup>
                    )
            }
        </>
    );
}
