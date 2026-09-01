import {Label} from "@/components/ui/label.tsx";

interface AnswerHeaderFieldsProps {
    title?: string;
    description?: string;
}

export default function AnswerHeaderFields({ title, description }: AnswerHeaderFieldsProps) {
    return (
        <div className="flex flex-col w-9/10 gap-12 mb-8 items-start justify-center">
            <div className="flex flex-row w-full items-center">
                <Label
                    className="w-full h-24 border-b-2 px-4 border-table-foreground text-4xl font-bold
                    text-foreground placeholder:text-muted-foreground focus:outline-none
                    focus:border-b-2 focus:border-button-background
                    "
                >
                    {title}
                </Label>
            </div>
            <div className="flex flex-row w-full items-center">
                <Label
                    className="flex justify-center w-full h-16 px-4 text-xl text-muted-foreground font-bold
                    placeholder:text-muted-foreground focus:outline-none
                    "
                >
                    {description}
                </Label>
            </div>
        </div>
    );
}
