import type { TelephoneCreateDTO } from "../telephone/TelephoneCreateDTO";
import type { AddressCreateDTO } from "../address/AddressCreateDTO";

export interface GuardianCreateDTO {
    name: string;
    cpf: string;
    email: string;
    telephones: TelephoneCreateDTO[];
    address: AddressCreateDTO;
}
