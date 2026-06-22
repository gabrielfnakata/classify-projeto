import { Form, Formik, useFormikContext } from "formik";
import { FormikInput } from "../formik-input/FormikInput";
import * as Yup from "yup";
import { FormikSelectField } from "../formik-input/FormikSelect";
import { useEffect } from "react";
import CpfInput from "../cpf-input/CpfInput";

export interface FilterConfig {
    name: string;
    inputType: 'text' | 'number' | 'select' | 'cpf';
    width: number;
    label?: string;
    validation?: Yup.AnySchema;
    options?: {value: string; label: string}[];
    placeholder?: string;
}

interface FilterRowProps {
    filters: FilterConfig[];
    onSubmit: (values: Record<string, string>) => void;
    onValuesChange?: (values: Record<string, string>) => void;
}

function AutoSubmit({ onValuesChange, debounceMs }: { onValuesChange?: (v: Record<string, string>) => void; debounceMs: number }) {
    const { values, submitForm } = useFormikContext<Record<string, string>>();

    useEffect(() => {
        const timer = setTimeout(() => {
            submitForm();
            onValuesChange?.(values);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [values]);

    return null;
}

export default function FilterRow({
    filters,
    onSubmit,
    onValuesChange
}: FilterRowProps) {

  const widthClasses: Record<string, string> = {
    "25": 'w-1/4',
    "33": 'w-1/3',
    "50": 'w-1/2',
    "100": 'w-full',
  };

  const validationSchema = Yup.object().shape(
    filters.reduce(
        (schema, filter) => ({
            ...schema,
            [filter.name]: filter.validation || null
        }),
        {}
    )
  );

  const initialValues = filters.reduce(
    (values, filter) => ({
        ...values,
        [filter.name]: "",
    }),
    {}
  );

  return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
        >
            {({}) => (
                <Form className="w-full flex gap-2 justify-center">
                    <AutoSubmit debounceMs={600} onValuesChange={onValuesChange} />
                    {filters.map((filter: FilterConfig) => (
                        <div className={widthClasses[filter.width]}>
                            {filter.inputType === 'select' ? (
                                <FormikSelectField
                                name={filter.name}
                                placeholder={filter.placeholder}
                                options={filter.options || []}
                                />
                            ) : filter.inputType === 'cpf' ? (
                                <CpfInput
                                    name={filter.name}
                                    placeholder={filter.placeholder}
                                    isFilter={true}
                                />
                            ) : (
                                <FormikInput
                                name={filter.name}
                                label={filter.label}
                                placeholder={filter.placeholder}
                                type={filter.inputType}
                                isFilter={true}
                                />
                            )}
                        </div>
                    ))}
                </Form>
            )}
        </Formik>
  )
};
