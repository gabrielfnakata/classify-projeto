interface AnswerHeaderFieldsProps {
    title?: string;
    description?: string;
}

export default function AnswerHeaderFields({ title, description }: AnswerHeaderFieldsProps) {
    return (
        <div className="flex flex-col w-8/10 gap-12 mb-8 items-start justify-center">
            <h1 className="w-full min-h-24 border-b-2 px-4 border-table-foreground text-4xl font-bold text-foreground">
                {title}
            </h1>
            <p className="w-full px-4 text-xl text-muted-foreground font-bold whitespace-pre-wrap">
                {description}
            </p>
        </div>
    );
}
