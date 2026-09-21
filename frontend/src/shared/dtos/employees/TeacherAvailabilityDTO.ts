import type { WeekdayKey } from "@/shared/utils/weekdays";

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
