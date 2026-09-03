import {useLocation, useParams} from "react-router";
import type {FormCreateDTO} from "@/shared/dtos/form/FormCreateDTO.ts";
import useFetch from "@/hooks/useFetch.tsx";
import type {FormInfoDTO} from "@/shared/dtos/form/FormInfoDTO.ts";
import FormHeaderActions from "@/pages/forms/new-form/FormHeaderActions.tsx";
import FormHeaderFields from "@/pages/forms/new-form/FormHeaderFields.tsx";
import QuestionList from "@/pages/forms/new-form/QuestionList.tsx";
import {Formik} from "formik";
import {formatYMD} from "@/shared/utils/date-formatter.ts";

export default function PreviewForm() {
    const { id } = useParams();
    const location = useLocation();
    const { data: fetchedForm } = useFetch<FormInfoDTO>(id ? `/form/${id}` : null);

    const formFromState = location.state?.form as FormCreateDTO | undefined;

    const fromFormInfoDTO = (source: FormInfoDTO): FormCreateDTO => {
        return {
            title: source.title,
            description: source.description,
            limitDate: formatYMD(new Date()),
            questions: source.questions.map((q) => ({
                question: q.question,
                answerType: q.answerType,
                isRequired: q.isRequired,
                options: q.options
            })),
        };
    }

    const form = id
        ? (fetchedForm ? fromFormInfoDTO(fetchedForm) : undefined)
        : formFromState;

    if (!form) return (<></>);

    return (
        <Formik initialValues={form} onSubmit={()=>{}}>
            <div className="flex flex-col background h-full w-full items-center justify-center">
                <div className="flex flex-col w-full h-full py-17 gap-[2vh] justify-start items-center">
                    <FormHeaderActions type="preview"/>
                    <FormHeaderFields readOnly/>
                    <QuestionList readOnly/>
                </div>
            </div>
        </Formik>
    );
}
