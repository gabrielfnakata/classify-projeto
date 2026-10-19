import type { Field } from "@/components/page-templates/form/NewEntityPage";
import NewEntityPage from "@/components/page-templates/form/NewEntityPage";
import api from "@/services/api";
import { parseTelephone } from "@/shared/utils/telephone-parser";
import { NewStudentValidationSchema } from "@/validation/StudentSchema";
import { useNavigate } from "react-router";
import type { StudentCreateDTO } from "@/shared/dtos/student/StudentCreateDTO";
import type { StudentDTO } from "@/shared/dtos/student/StudentDTO";
import { welcomeEmailNotice } from "@/shared/utils/welcome-email-notice";

export default function NewStudent() {
    const navigate = useNavigate();
    const fields: Field[] = [
        {key: 'name', name: 'name', label: 'Nome', type: 'text' as const, required: true},
        {key: 'birthDate', name: 'birthDate', label: 'Data de Nascimento', type: 'date' as const, required: true},
        {key: 'email', name: 'email', label: 'E-mail', type: 'text' as const, required: true},
        {key: 'cpf', name: 'cpf', label: 'CPF', type: 'cpf' as const, required: true},
        {key: 'registrationDate', name: 'registrationDate', label: 'Data de matrícula', type: 'date' as const, required: true},
        {key: 'telephone1', name: 'telephone1', label: 'Telefone 1', type: 'phone' as const, required: true},
        {key: 'telephone2', name: 'telephone2', label: 'Telefone 2', type: 'phone' as const, required: false},
    ];

    const initialFormValue = {
        name: '',
        birthDate: '',
        email: '',
        cpf: '',
        registrationDate: '',
        telephone1: '',
        telephone2: ''
    };

    function buildPayload(values: Record<string, unknown>): StudentCreateDTO {
        const telephones = [values.telephone1, values.telephone2]
            .filter((phone): phone is string => Boolean(phone))
            .map(parseTelephone);

        return {
            name: values.name as string,
            cpf: values.cpf as string,
            email: values.email as string,
            birthDate: values.birthDate as string,
            registrationDate: values.registrationDate as string,
            telephones: telephones,
            guardians: [],
            account: { email: values.email as string, password: null }
        };
    }

    async function handleSubmit(payload: StudentCreateDTO) {
        const { data } = await api.post<StudentDTO>('/student', payload);
        navigate('/students', { state: { notice: welcomeEmailNotice(data.name, data.email, data.welcomeEmailSent) } });
    }

    return (
        <NewEntityPage
            title="Novo Aluno"
            fields={fields}
            backRoute="/students"
            initialFormValue={initialFormValue}
            validationSchema={NewStudentValidationSchema}
            buildPayload={buildPayload}
            onSubmit={handleSubmit}

        />
    );

};
