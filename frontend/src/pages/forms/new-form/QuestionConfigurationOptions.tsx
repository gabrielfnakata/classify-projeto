import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Menu} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
    DropdownMenuRadioGroup, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Switch} from "@/components/ui/switch.tsx";

interface QuestionConfigurationOptionsProps {
    required: boolean;
    handleRequiredChange: (required: boolean) => void;
    handleDuplicateQuestion: () => void;
    handleDeleteQuestion: () => void;
}

export default function QuestionConfigurationOptions(
    {required, handleRequiredChange, handleDuplicateQuestion, handleDeleteQuestion}: QuestionConfigurationOptionsProps
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
                <DropdownMenuRadioGroup>
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
                </DropdownMenuRadioGroup>
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
