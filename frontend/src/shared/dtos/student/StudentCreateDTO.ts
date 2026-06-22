import type { TelephoneCreateDTO } from "../telephone/TelephoneCreateDTO";
import type { GuardianCreateDTO } from "../guardian/GuardianCreateDTO";

export interface StudentCreateDTO {
    name: string;
    birthDate: string;
    email: string;
    cpf: string;
    registrationDate: string;
    telephones: TelephoneCreateDTO[];
    guardians: GuardianCreateDTO[];
}
