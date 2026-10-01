export interface AuditDTO {
    id: number;
    tableName: string;
    registerId: number;
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    userEmail: string;
    userUuid: string;
    userRole?: string;
    date: string;
    oldData: string | null;
    newData: string;
}

export interface AuditFilterParams {
    tableName?: string;
    registerId?: number | string;
    operation?: string;
    startDate?: string;
    endDate?: string;
}
