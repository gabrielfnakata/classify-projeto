import type { Field } from "@/components/page-templates/form/NewEntityPage";
import NewEntityPage from "@/components/page-templates/form/NewEntityPage";
import api from "@/services/api";
import type { SubjectCreateDTO } from "@/shared/dtos/subject/SubjectCreateDTO";
import { NewSubjectValidationSchema } from "@/validation/SubjectSchema";
import { useNavigate } from "react-router";

export default function NewSubject() {
    const navigate = useNavigate();
    const fields: Field[] = [
        {key: 'description', name: 'description', label: 'Descrição', type: 'text' as const, required: true}
    ];

    const initialFormValue = {
        description: ''
    };
    
    function buildPayload(values: Record<string, any>): SubjectCreateDTO {
        return {
            description: values.description as string
        };
    }

    async function handleSubmit(payload: SubjectCreateDTO) {
        await api.post('/subject', payload);
        navigate('/subjects');
    }

    return (
        <NewEntityPage
            title="Disciplina"
            fields={fields}
            backRoute="/subjects"
            initialFormValue={initialFormValue}
            validationSchema={NewSubjectValidationSchema}
            buildPayload={buildPayload}
            onSubmit={handleSubmit}
        
        />
    )

};
