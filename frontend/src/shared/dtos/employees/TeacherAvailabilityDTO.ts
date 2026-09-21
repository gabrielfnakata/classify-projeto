import type { WeekdayKey } from "@/shared/utils/weekdays";

// Bloco semanal de atendimento do professor. Horários vêm do backend como "HH:mm:ss".
export interface TeacherAvailabilityDTO {
    uuid: string;
    weekday: WeekdayKey;
    startTime: string;
    endTime: string;
}

export interface TeacherAvailabilityCreateDTO {
    weekday: WeekdayKey;
    startTime: string;
    endTime: string;
}
