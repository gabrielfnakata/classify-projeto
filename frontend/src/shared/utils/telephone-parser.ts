import type { TelephoneCreateDTO } from "@/shared/dtos/telephone/TelephoneCreateDTO";

export function parseTelephone(maskedPhone: string): TelephoneCreateDTO {
    const digits = maskedPhone.replace(/\D/g, "");

    return {
        country: "BR",
        ddd: digits.slice(0, 2),
        number: digits
    };
}
