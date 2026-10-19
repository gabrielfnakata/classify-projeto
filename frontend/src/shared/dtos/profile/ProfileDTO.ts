import type { RoleDTO } from "../role/RoleDTO";
import type { TelephoneDTO } from "../telephone/TelephoneDTO";

export interface ProfileDTO {
    uuid: string;
    name: string;
    email: string;
    cpf: string;
    birthDate: string | null;
    hireDate: string | null;
    role: RoleDTO | null;
    telephones: TelephoneDTO[];
}
