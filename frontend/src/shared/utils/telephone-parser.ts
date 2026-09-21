import type { TelephoneCreateDTO } from "@/shared/dtos/telephone/TelephoneCreateDTO";

export function parseTelephone(maskedPhone: string): TelephoneCreateDTO {
    const digits = maskedPhone.replace(/\D/g, "");

    return {
        country: "BR",
        ddd: digits.slice(0, 2),
        number: digits
    };
}


// Exibição: "(65) 91111-2223" ou "(11) 1234-5678". O backend às vezes devolve o DDD vazio e
// o número completo em `number`; nesse caso o DDD é lido dos dois primeiros dígitos.
export function formatTelephone(phone: { ddd: string; number: string }): string {
    const digits = phone.number.replace(/\D/g, "");
    let ddd = phone.ddd;
    let local = digits;

    if (ddd && digits.startsWith(ddd) && digits.length > 9) local = digits.slice(ddd.length);
    else if (!ddd && digits.length >= 10) { ddd = digits.slice(0, 2); local = digits.slice(2); }

    if (local.length === 9) return `(${ddd}) ${local.slice(0, 5)}-${local.slice(5)}`;
    if (local.length === 8) return `(${ddd}) ${local.slice(0, 4)}-${local.slice(4)}`;
    return ddd ? `(${ddd}) ${local}` : local;
}
