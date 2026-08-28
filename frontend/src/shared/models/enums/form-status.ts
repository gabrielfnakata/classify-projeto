export type FormStatus = "PENDING" | "ANSWERED" | "CORRECTED";

export enum statusLabel {
    PENDING = "Pendente",
    ANSWERED = "Respondido",
    CORRECTED =  "Corrigido",
};

export enum statusVariant {
    PENDING = "warning",
    ANSWERED = "info",
    CORRECTED = "success",
};
