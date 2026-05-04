import { Form, Formik } from "formik";
import { FormikInput } from "./FormikInput";
import * as Yup from "yup";
import { SelectField } from "../common/select-field";

export interface FilterConfig {
    name: string;
    label: string;
    inputType: 'text' | 'number' | 'select';
    width: number;
    validation?: Yup.AnySchema;
    options?: {value: string; label: string}[];
    placeholder?: string;
}

interface FilterRowProps {
    filters: FilterConfig[];
    onSubmit: (values: Record<string, string>) => void;
    onValuesChange?: (values: Record<string, string>) => void;
}

export default function FilterRow({
    filters,
    onSubmit,
    onValuesChange,
}: FilterRowProps) {

  const widthClasses: Record<string, string> = {
    "25": 'w-1/4',
    "33": 'w-1/3',
    "50": 'w-1/2'
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
            {({values, handleChange}) => (
                <Form className="w-full flex flex-wrap gap-4 justify-center">
                    {filters.map((filter: FilterConfig) => (
                        <div className={widthClasses[filter.width]}>
                            {filter.inputType === 'select' ? (
                                <SelectField
                                placeholder={filter.placeholder}
                                options={filter.options || []}
                                onChange={(value) => handleChange(value)}
                                />
                            ) : (
                                <FormikInput
                                name={filter.name}
                                label={filter.label}
                                placeholder={filter.label}
                                type={filter.inputType}
                                />
                            )}
                        </div>
                    ))}
                </Form>
            )}
        </Formik>
  )
};
