import { Form, Formik } from "formik";
import { FormikInput } from "../formik-input/FormikInput";
import * as Yup from "yup";
import { FormikSelectField } from "../formik-input/FormikSelect";
import CpfInput from "../cpf-input/CpfInput";
import { Button } from "../ui/button";
import { Search } from "lucide-react";

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
            onSubmit={(values): void => {
                onSubmit(values);
                onValuesChange?.(values);
            }}
        >
            {({ resetForm }) => (
                <Form className="w-full flex gap-2 justify-center">
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

                    <div className="flex gap-2">
                        <Button type="submit" className="h-9 w-24 px-4" >
                            <Search className="mr-2 h-4 w-4" />
                            Buscar
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 w-24 px-4"
                            onClick={() => {
                                resetForm({ values: initialValues });
                                onSubmit(initialValues);
                                onValuesChange?.(initialValues);
                            }}
                        >
                            Limpar
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
  )
};
