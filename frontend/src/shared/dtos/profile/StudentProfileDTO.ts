import type { TelephoneDTO } from "../telephone/TelephoneDTO";

export interface StudentProfileDTO {
    uuid: string;
    name: string;
    email: string;
    cpf: string;
    birthDate: string | null;
    registrationDate: string | null;
    telephones: TelephoneDTO[];
}
