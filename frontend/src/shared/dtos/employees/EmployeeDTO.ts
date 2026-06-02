import type { RoleDTO } from "../role/RoleDTO";

export interface EmployeeDTO {
    uuid: string;
    name: string;
    cpf: string;
    birthDate: Date;
    email: string;
    telephone: string;
    address: string;
    role: RoleDTO;
}