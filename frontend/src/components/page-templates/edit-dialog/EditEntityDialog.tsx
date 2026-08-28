import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { FormikInput } from "@/components/formik-input/FormikInput";
import { FormikSelectField } from "@/components/formik-input/FormikSelect";
import CpfInput from "@/components/cpf-input/CpfInput";
import PhoneInput from "@/components/phone-input/PhoneInput";
import { FormGrid } from "@/components/features/form-grid";
import { Button } from "@/components/ui/button";
import type { Field } from "@/components/page-templates/form/NewEntityPage";

interface EditEntityDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    fields: Field[];
    initialValues: Record<string, unknown>;
    validationSchema: Yup.AnyObjectSchema;
    onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
    formKey?: string;
}

export default function EditEntityDialog({
    open, onOpenChange, title, fields, initialValues, validationSchema, onSubmit, formKey,
}: EditEntityDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {open && (
                    <Formik
                        key={formKey}
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                    >
                        <Form className="flex flex-col gap-4 p-5">
                            <FormGrid>
                                {fields.map(field => {
                                    switch (field.type) {
                                        case 'text':
                                        case 'number':
                                            return <FormikInput key={field.key} name={field.name} label={field.label} type={field.type} required={field.required} />;
                                        case 'date':
                                            return <FormikInput key={field.key} name={field.name} label={field.label} type="date" required={field.required} />;
                                        case 'select':
                                            return <FormikSelectField key={field.key} name={field.name} label={field.label} options={field.options ?? []} />;
                                        case 'cpf':
                                            return <CpfInput key={field.key} name={field.name} label={field.label} required={field.required} />;
                                        case 'phone':
                                            return <PhoneInput key={field.key} name={field.name} label={field.label} required={field.required} />;
                                    }
                                })}
                            </FormGrid>
                            <div className="flex flex-row justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    Salvar
                                </Button>
                            </div>
                        </Form>
                    </Formik>
                )}
            </DialogContent>
        </Dialog>
    );
}