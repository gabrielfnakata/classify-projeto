import type { Field } from "@/components/page-templates/form/NewEntityPage";
import NewEntityPage from "@/components/page-templates/form/NewEntityPage";
import api from "@/services/api";
import type { ClassroomCreateDTO } from "@/shared/dtos/classroom/ClassroomCreateDTO";
import { NewClassroomValidationSchema } from "@/validation/ClassroomSchema";
import { useNavigate } from "react-router";

export default function NewClassroom() {
    const navigate = useNavigate();

    const fields: Field[] = [
        { key: 'name', name: 'name', label: 'Nome', type: 'text' as const, required: true },
        { key: 'capacity', name: 'capacity', label: 'Capacidade', type: 'number' as const, required: true },
        { key: 'isDisabled', name: 'isDisabled', label: 'Desativada', type: 'select' as const, options: [
            {label: "Sim", value: "true"}, {label: "Não", value: "false"}
        ], required: true },
    ];

    const initialFormValue = {
        name: '',
        capacity: '',
        isDisabled: 'false'
    };

    function buildPayload(values: Record<string, unknown>): ClassroomCreateDTO {
        return {
            name: values.name as string,
            capacity: values.capacity as number,
            isDisabled: values.isDisabled as boolean
        };
    };

    async function handleSubmit(payload: ClassroomCreateDTO) {
        await api.post('/classroom', payload);
        navigate('/classrooms');
    }

    return (
        <NewEntityPage
            title="Nova Sala de Aula"
            fields={fields}
            backRoute="/classrooms"
            buildPayload={buildPayload}
            onSubmit={handleSubmit}
            validationSchema={NewClassroomValidationSchema}
            initialFormValue={initialFormValue}
        />
    );
};
