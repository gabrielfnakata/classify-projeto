import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Menu} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuPortal,
    DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import type {AnswerType} from "@/shared/models/enums/answer-type.ts";
import { answerTypeOptions } from "@/shared/models/constants/answer-type-options"

interface QuestionConfigurationOptionsProps {
    currentType: AnswerType;
    required: boolean;
    handleRequiredChange: (required: boolean) => void;
    handleDuplicateQuestion: () => void;
    handleDeleteQuestion: () => void;
    handleChangeAnswerType: (answerType: AnswerType) => void;
}

export default function QuestionConfigurationOptions(
    {currentType, required, handleRequiredChange, handleDuplicateQuestion, handleDeleteQuestion, handleChangeAnswerType: handleAnswerTypeChange}: QuestionConfigurationOptionsProps
) {

    const dropdownTrigger = (
        <Tooltip>
            <TooltipTrigger
                className="flex justify-end items-center h-8 p-1 rounded-sm text-black
                        hover:bg-button-background hover:text-white hover:transition-colors hover:duration-80
                        hover:cursor-pointer focus:outline-none
                        "
                onClick={() => {}}
            >
                <Menu />
                <TooltipContent>
                    Ver opções
                </TooltipContent>
            </TooltipTrigger>
        </Tooltip>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
                {dropdownTrigger}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        className="flex justify-between"
                        onClick={() => handleRequiredChange(!required)}
                    >
                        Obrigatória
                        <Switch
                            checked={required}
                            className=""
                        />
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            Mudar Tipo da Questão
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                {answerTypeOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        className="flex flex-row gap-2 px-4"
                                        disabled={option.value === currentType}
                                        onClick={() => handleAnswerTypeChange(option.value)}
                                    >
                                        {option.icon}
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator/>
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onClick={() => handleDuplicateQuestion()}
                    >
                        Duplicar Questão
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => handleDeleteQuestion()}
                        variant="destructive"
                    >
                        Remover Questão
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>

    );
}
