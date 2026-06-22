import type { UserCreateDTO } from "../user/UserCreateDTO";
import type { TelephoneCreateDTO } from "../telephone/TelephoneCreateDTO";

export interface EmployeeCreateDTO {
    name: string;
    birthDate: string;
    cpf: string;
    hireDate: string;
    user: UserCreateDTO;
    telephones: TelephoneCreateDTO[];
}
