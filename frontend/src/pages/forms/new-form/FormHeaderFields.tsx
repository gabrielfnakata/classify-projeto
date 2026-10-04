import {useFormikContext} from "formik";
import TextareaAutosize from "react-textarea-autosize";
import type {FormCreateDTO} from "@/shared/dtos/form/FormCreateDTO.ts";

interface FormHeaderFieldsProps {
    readOnly?: boolean;
}

export default function FormHeaderFields({ readOnly = false }: FormHeaderFieldsProps) {
    const { values, handleChange } = useFormikContext<FormCreateDTO>();
    return (
        <div className="flex flex-col w-8/10 gap-12 mb-8 items-start justify-center">
            <div className="flex flex-row w-full items-center">
                <input
                    name="title"
                    value={values.title}
                    readOnly={readOnly}
                    onChange={handleChange}
                    placeholder="Título do Formulário"
                    className="w-full h-24 border-b-2 px-4 border-table-foreground text-4xl font-bold
                    text-foreground placeholder:text-muted-foreground focus:outline-none
                    focus:border-b-2 focus:border-button-background
                    "
                />
            </div>
            <div className="flex flex-row w-full justify-start items-center">
                <TextareaAutosize
                    name="description"
                    value={values.description}
                    readOnly={readOnly}
                    onChange={handleChange}
                    placeholder="Descrição do formulário"
                    minRows={1}
                    className="w-full h-16 px-4 text-xl text-muted-foreground font-bold text-start
                    placeholder:text-muted-foreground focus:outline-none resize-none
                    " />
            </div>
        </div>
    );
}
