import type { TelephoneCreateDTO } from "@/shared/dtos/telephone/TelephoneCreateDTO";

export function parseTelephone(maskedPhone: string): TelephoneCreateDTO {
    const digits = maskedPhone.replace(/\D/g, "");

    return {
        country: "BR",
        ddd: digits.slice(0, 2),
        number: digits, 
    };
}

export function formatTelephone(telephone: { ddd: string; number: string }): string {
    const localNumber = telephone.number.slice(2); 
    return `(${telephone.ddd}) ${localNumber.slice(0, 5)}-${localNumber.slice(5)}`;
}