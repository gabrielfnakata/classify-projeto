/** Resposta das operações em lote: o que foi aplicado e o motivo de cada falha. */
export interface BatchFailureDTO {
    uuid: string;
    message: string;
}

export interface BatchResultDTO {
    applied: number;
    failures: BatchFailureDTO[];
}
