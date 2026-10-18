package br.com.ifsp.classify.dtos.create;

import java.time.LocalTime;

public record TeacherAvailabilityCreateDTO(
        String weekday,
        LocalTime startTime,
        LocalTime endTime
) {}
