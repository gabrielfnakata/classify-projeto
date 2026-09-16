package br.com.ifsp.classify.dtos.get;

import java.time.LocalTime;

public record TeacherAvailabilityGetDTO(
        String uuid,
        String weekday,
        LocalTime startTime,
        LocalTime endTime
) {}
