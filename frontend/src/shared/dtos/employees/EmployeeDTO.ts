import type { TelephoneDTO } from "../telephone/TelephoneDTO";

export interface EmployeeDTO {
    uuid: string;
    name: string;
    birthDate: string;
    cpf: string;
    hireDate: string;
    telephones: TelephoneDTO[];
    userUuid: string;
}