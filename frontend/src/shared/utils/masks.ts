export function formatCpf(cpf: string | null | undefined): string {
    const digits = (cpf ?? "").replace(/\D/g, "");
    if (digits.length !== 11) return cpf ?? "";

    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatTelephone(number: string | null | undefined): string {
    const digits = (number ?? "").replace(/\D/g, "");
    if (digits.length !== 11) return number ?? "";

    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}
