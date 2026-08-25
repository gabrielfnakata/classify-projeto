import type { TelephoneCreateDTO } from "@/shared/dtos/telephone/TelephoneCreateDTO";

export function parseTelephone(maskedPhone: string): TelephoneCreateDTO {
    const digits = maskedPhone.replace(/\D/g, "");

    return {
        country: "BR",
        ddd: digits.slice(0, 2),
        number: digits.slice(2),
    };
}

export function formatTelephone(telephone: { ddd: string; number: string }): string {
    return `(${telephone.ddd}) ${telephone.number.slice(0, 5)}-${telephone.number.slice(5)}`;
}