import type { TelephoneDTO } from "../telephone/TelephoneDTO";

// Espelha o EmployeeGetDTO do backend (não expõe e-mail nem cargo).
export interface EmployeeDTO {
    uuid: string;
    name: string;
    cpf: string;
    birthDate: Date;
    hireDate: Date;
    telephones: TelephoneDTO[];
    userUuid: string | null;
}
