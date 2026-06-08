import type { GuardianDTO } from "../guardian/GuardianDTO";

export interface StudentDTO {
    uuid: string;
    name: string;
    birthDate: Date;
    registrationDate: Date;
    email: string;
    address: string;
    neighborhood: string;
    school: string;     
    grade: string;
    referral: boolean;
    referrerName?: string;
    guardians: GuardianDTO[];
}