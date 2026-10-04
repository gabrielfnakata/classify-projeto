import { useLocation, useNavigate } from "react-router";
import type { FormCreateDTO } from "@/shared/dtos/form/FormCreateDTO.ts";
import { Formik, type FormikHelpers } from "formik";
import { formatYMD } from "@/shared/utils/date-formatter.ts";
import FormHeaderActions from "@/pages/forms/new-form/FormHeaderActions.tsx";
import FormHeaderFields from "./new-form/FormHeaderFields";
import QuestionList from "./new-form/QuestionList";
import api from "@/services/api.ts";
import { FormValidationSchema } from "@/validation/FormSchema.ts";
import {useState} from "react";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog.tsx";

export default function NewForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const form = location.state?.form as FormCreateDTO;
    // TODO: envolver lógica do dialog em context
    const [open, setOpen] = useState(false);

    const initialValues = {
        title: form?.title ?? '',
        description: form?.description ?? '',
        hasScore: false,
        limitDate: formatYMD(new Date()),
        questions: form?.questions ?? []
    } as FormCreateDTO;

    const handleSubmit = async (values: FormCreateDTO, helpers: FormikHelpers<FormCreateDTO>) => {
        helpers.setSubmitting(true);
        await api.post('/form', values);
        setOpen(true);
        helpers.setSubmitting(false);
    }

    return (
        <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={FormValidationSchema}>
            <div className="flex flex-col background h-full w-full items-center justify-center">
                <div className="flex flex-col w-full h-full py-17 gap-[2vh] justify-start items-center">
                    <FormHeaderActions type="create"/>
                    <FormHeaderFields />
                    <QuestionList />
                </div>
            <ConfirmationDialog
                open={open}
                onOpenChange={(open) => {
                    setOpen(open);
                    if (!open) navigate("/posted-forms");
                }}
                message={"O formulário foi salvo com sucesso."}/>
            </div>
        </Formik>
    );
}
