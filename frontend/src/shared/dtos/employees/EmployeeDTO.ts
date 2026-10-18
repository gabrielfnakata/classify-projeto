import type { RoleDTO } from "../role/RoleDTO";

export interface EmployeeDTO {
    uuid: string;
    name: string;
    cpf: string;
    birthDate: string;
    hireDate: string;
    telephones: { country: string; ddd: string; number: string }[];
    userUuid: string;
    email: string;
    roleId: string;
    roleDescription: string;
}