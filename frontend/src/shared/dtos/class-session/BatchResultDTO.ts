export interface BatchFailureDTO {
    uuid: string;
    message: string;
}

export interface BatchResultDTO {
    applied: number;
    failures: BatchFailureDTO[];
}
