import CpfInput from "@/components/cpf-input/CpfInput";
import PhoneInput from "@/components/phone-input/PhoneInput";
import { FormikInput } from "@/components/formik-input/FormikInput";
import { FormikSelectField } from "@/components/formik-input/FormikSelect";
import { Button } from "@/components/ui/button";
import { ContentCard } from "@/components/layout/content-card";
import { PageHeader } from "@/components/layout/page-header";
import { FormGrid } from "@/components/features/form-grid";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router";

interface NewEntityPageProps<T> {
    title: string;
    fields: Field[];
    backRoute: string;
    initialFormValue: Record<string, unknown>;
    validationSchema: Yup.AnyObjectSchema;
    buildPayload: (values: Record<string, unknown>) => T;
    onSubmit: (payload: T) => void | Promise<void>;
};

export interface Field {
    key: string;
    name: string;
    label: string;
    type: 'text' | 'number' | 'cpf' | 'date' | 'select' | 'phone';
    options?: {label: string, value: string}[];
    required: boolean;
}

export default function NewEntityPage<T>({
    title, fields, backRoute, initialFormValue, validationSchema, buildPayload, onSubmit
}: NewEntityPageProps<T>) {
    const navigate = useNavigate();

    const handleSubmit = (values: Record<string, unknown>) => {
        return onSubmit(buildPayload(values));
    };

    return (
        <div className="flex flex-col background h-full w-full items-center justify-center">
            <div className="flex flex-col w-full h-full gap-[2vh] justify-center items-center">
                <div className="flex flex-row w-4/5 items-center justify-between">
                    <PageHeader
                        title={`Novo ${title}`}
                    />
                </div>
                <ContentCard className="flex flex-col w-4/5 h-[64vh] p-8 gap-[4vh]">
                    <Formik
                        initialValues={initialFormValue}
                        onSubmit={handleSubmit}
                        validationSchema={validationSchema}
                    >
                        {({ isSubmitting }) => (
                            <Form className="flex flex-col gap-[3vh]">
                                <FormGrid>
                                    {fields.map(field => {
                                        switch(field.type) {
                                            case 'text':
                                            case 'number':
                                                return <FormikInput
                                                    key={field.key} name={field.name} label={field.label} type={field.type} required={field.required}
                                                />;
                                            case 'date':
                                                return <FormikInput
                                                    key={field.key} name={field.name} label={field.label} type="date" required={field.required}
                                                />;
                                            case 'select':
                                                return <FormikSelectField
                                                    key={field.key} name={field.name} label={field.label} options={field.options ?? []}
                                                />
                                            case 'cpf':
                                                return <CpfInput
                                                    key={field.key} name={field.name} label={field.label} required={field.required}
                                                />;
                                            case 'phone':
                                                return <PhoneInput
                                                    key={field.key} name={field.name} label={field.label} required={field.required}
                                                />;
                                        }
                                    })}
                                </FormGrid>
                                <div className="flex flex-row justify-end gap-4">
                                    <Button type="button" className="h-10 px-5 rounded-xl bg-red-400 text-sm font-semibold" onClick={() => {navigate(backRoute)}}>
                                        Voltar
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="h-10 px-5 rounded-xl text-sm font-semibold">
                                        Salvar
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </ContentCard>
            </div>
        </div>
    );
};
