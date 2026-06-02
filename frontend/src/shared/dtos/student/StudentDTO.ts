import type { GuardianDTO } from "../guardian/GuardianDTO";

export interface StudentDTO {
    uuid: string;
    name: string;
    birthDate: Date;
    registrationDate: Date;
    email: string;
    telephone: string;
    address: string;
    guardians: GuardianDTO[];
}