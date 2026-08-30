import { useLocation, useNavigate } from "react-router";
import type { FormCreateDTO } from "@/shared/dtos/form/FormCreateDTO.ts";
import {Formik, type FormikHelpers } from "formik";
import { formatYMD } from "@/shared/utils/date-formatter.ts";
import FormHeaderActions from "@/pages/forms/new-form/FormHeaderActions.tsx";
import FormHeaderFields from "./new-form/FormHeaderFields";
import QuestionList from "./new-form/QuestionList";
import api from "@/services/api.ts";

// TODO: Adicionar algumas validações

export default function NewForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const form = location.state?.form as FormCreateDTO;

    const initialValues = {
        title: form?.title ?? '',
        description: form?.description ?? '',
        limitDate: formatYMD(new Date()),
        questions: form?.questions ?? []
    } as FormCreateDTO;

    const handleSubmit = async (values: FormCreateDTO, helpers: FormikHelpers<FormCreateDTO>) => {
        helpers.setSubmitting(true);
        await api.post('/form', values);
        alert('Formulário criado com sucesso');
        navigate('/posted-forms');
        helpers.setSubmitting(false);
    }

    return (
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
            <div className="flex flex-col background h-full w-full items-center justify-center">
                <div className="flex flex-col w-full h-full py-23 gap-[2vh] justify-start items-center">
                    <FormHeaderActions />
                    <FormHeaderFields />
                    <QuestionList />
                </div>
            </div>
        </Formik>
    );
}
