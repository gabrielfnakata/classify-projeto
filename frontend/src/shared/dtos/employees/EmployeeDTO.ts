import type { TelephoneDTO } from "../telephone/TelephoneDTO";

// Espelha o EmployeeGetDTO do backend (não expõe e-mail nem cargo).
export interface EmployeeDTO {
    uuid: string;
    name: string;
    birthDate: string;
    cpf: string;
    hireDate: string;
    telephones: TelephoneDTO[];
    userUuid: string | null;
    email: string;
    roleId: string;
    roleDescription: string;
    welcomeEmailSent?: boolean;
}
