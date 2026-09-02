import {PageHeader} from "@/components/layout/page-header.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ArrowLeft, Ghost} from "lucide-react";
import {ContentCard} from "@/components/layout/content-card.tsx";
import {Label} from "@/components/ui/label.tsx";
import {useLocation, useNavigate, useParams} from "react-router";
import {AnswerType} from "@/shared/models/enums/answer-type.ts";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx";
import type {FormQuestionOptionCreateDTO} from "@/shared/dtos/form-question-options/FormQuestionOptionCreateDTO.ts";
import type {FormCreateDTO} from "@/shared/dtos/form/FormCreateDTO.ts";
import useFetch from "@/hooks/useFetch.tsx";
import type {FormInfoDTO} from "@/shared/dtos/form/FormInfoDTO.ts";
import type {FormQuestionOptionDTO} from "@/shared/dtos/form-question-options/FormQuestionOptionDTO.ts";
import TextareaAutosize from "react-textarea-autosize";

export default function PreviewForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: fetchedForm } = useFetch<FormInfoDTO>(id ? `/form/${id}` : null);

    const formFromState = location.state?.form as FormCreateDTO | undefined;

    const form = id ? fetchedForm : formFromState;

    return (
        <div className="flex flex-col background h-full w-full items-center justify-center">
            <div className="flex flex-col w-full h-full py-23 gap-[2vh] justify-start items-center">
                <div className="flex flex-row w-9/10 pt-6 sticky top-0 z-10 items-center justify-between">

                    <PageHeader
                        title={"Prévia do Formulário"}
                        action={
                            <div className="flex flex-row gap-4">
                                <Button
                                    className="h-10 px-5 bg-button-background rounded-xl text-sm font-semibold
                                    hover:bg-button-highlight hover:cursor-pointer
                                    "
                                    onClick={() =>
                                        id
                                        ? navigate('/posted-forms')
                                        : navigate('/new-form', { state: { form: form } })
                                    }
                                >
                                    <ArrowLeft/>
                                    Voltar
                                </Button>
                            </div>
                        }
                    />
                </div>
                <div className="flex flex-col w-8/10 gap-12 mb-8 items-start justify-center">
                    <div className="flex flex-row w-full items-center">
                        <Label
                            className="w-full h-24 border-b-2 px-4 border-table-foreground text-4xl font-bold
                                    text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-b-2 focus:border-button-background
                                    "
                        >
                            {form?.title}
                        </Label>
                    </div>
                    <div className="flex flex-row w-full justify-start items-center">
                        <Label
                            className="flex justify-center w-full max-h-fit px-4 text-xl text-muted-foreground font-bold
                                    text-muted-foreground placeholder:text-muted-foreground focus:outline-none
                                    "
                        >
                            {form?.description}
                        </Label>
                    </div>
                </div>
                <div className="flex flex-col gap-10 w-8/10">
                    {
                        form?.questions && form?.questions.length > 0
                        ? form?.questions.map((question, index) => {
                            return (
                                <ContentCard key={index} className="flex flex-col w-full gap-8">
                                    <div className="flex w-full">
                                        <Label
                                            className="w-full h-16 px-2 text-2xl font-bold
                                                text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-b-2 focus:border-button-background
                                                "
                                        >
                                            {question.question} {question.isRequired ? '*' : ''}
                                        </Label>
                                    </div>
                                    <QuestionAnswer
                                        type={question.answerType}
                                        options={question.options ?? []}
                                    />
                                </ContentCard>
                            );
                        }) : (
                            <div className="flex flex-col justify-center items-center w-full mt-24 gap-8">
                                <Ghost className="scale-200 text-foreground opacity-50"/>
                                <Label className="text-foreground text-center opacity-50">Ainda não há questões no seu
                                    formulário</Label>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}

interface QuestionAnswerProps {
    type: AnswerType;
    options: FormQuestionOptionCreateDTO[] | FormQuestionOptionDTO[];
}

function QuestionAnswer({ type, options }: QuestionAnswerProps) {
    if (type === AnswerType.TEXT) {
        return (
            <TextareaAutosize
                className="
                flex field-sizing-content min-h-8 w-full rounded-lg border border-border bg-white p-4
                text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring
                focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50
                disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20
                md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50
                dark:aria-invalid:ring-destructive/40 border-border h-8 p-4 placeholder:text-muted-foreground
                resize-none
                "
                minRows={1}
            />
        );
    }

    const renderIndicator = (_option: FormQuestionOptionCreateDTO | FormQuestionOptionDTO, i: number) => {
        if (type === AnswerType.MULTI_SELECT) {
            return (
                <Checkbox
                    className="bg-white text-black"
                />
            );
        }
        return (
            <RadioGroupItem
                value={`random-question-${i}`}
                className="bg-white text-black"
            />
        );
    };

    const optionsList = options.map((option, i) => (
        <div key={i} className="flex justify-start items-center gap-2 pl-4">
            {renderIndicator(option, i)}
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
                    : <RadioGroup defaultValue=''>{optionsList}</RadioGroup>
            }
        </>
    );
}
