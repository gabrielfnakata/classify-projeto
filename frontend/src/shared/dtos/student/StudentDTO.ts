import type { GuardianDTO } from "../guardian/GuardianDTO";
import type { TelephoneDTO } from "../telephone/TelephoneDTO";

export interface StudentDTO {
    uuid: string;
    name: string;
    birthDate: Date;
    registrationDate: Date;
    email: string;
    cpf: string;
    telephones: TelephoneDTO[];
    guardians: GuardianDTO[];
}