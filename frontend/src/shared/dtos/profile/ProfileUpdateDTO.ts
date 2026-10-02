import type { TelephoneCreateDTO } from "../telephone/TelephoneCreateDTO";

export interface ProfileUpdateDTO {
    name: string;
    birthDate: string | null;
    telephone: TelephoneCreateDTO | null;
}
