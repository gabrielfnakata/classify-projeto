import {useFormikContext} from "formik";
import type {FormCreateDTO} from "@/shared/dtos/form/FormCreateDTO.ts";

export default function FormHeaderFields() {
    const { values, handleChange } = useFormikContext<FormCreateDTO>();
    return (
        <div className="flex flex-col w-9/10 gap-12 mb-8 items-start justify-center">
            <div className="flex flex-row w-full items-center">
                <input
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    placeholder="Título do Formulário"
                    className="w-full h-24 border-b-2 px-4 border-table-foreground text-4xl font-bold
                    text-foreground placeholder:text-muted-foreground focus:outline-none
                    focus:border-b-2 focus:border-button-background
                    "
                />
            </div>
            <div className="flex flex-row w-full items-center">
                <input
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    placeholder="Descrição do formulário"
                    className="w-full h-16 px-4 text-xl text-muted-foreground font-bold text-center
                    placeholder:text-muted-foreground focus:outline-none
                    " />
            </div>
        </div>
    );
}
