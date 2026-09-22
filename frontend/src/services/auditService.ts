import api from "./api";
import type { AuditDTO, AuditFilterParams } from "@/shared/dtos/audit/AuditDTO";

export const auditService = {
    getLogs: async (params?: AuditFilterParams): Promise<AuditDTO[]> => {
        const response = await api.get<AuditDTO[]>('/audit', { params });
        return response.data || [];
    },

    getLogsByTable: async (tableName: string): Promise<AuditDTO[]> => {
        const response = await api.get<AuditDTO[]>(`/audit/${tableName}`);
        return response.data || [];
    },

    getLogsByRegister: async (tableName: string, registerId: number | string): Promise<AuditDTO[]> => {
        const response = await api.get<AuditDTO[]>(`/audit/${tableName}/${registerId}`);
        return response.data || [];
    }
};
