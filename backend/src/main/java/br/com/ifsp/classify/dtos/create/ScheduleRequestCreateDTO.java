package br.com.ifsp.classify.dtos.create;

import java.time.LocalDateTime;

public record ScheduleRequestCreateDTO(
        String subjectTeacherUuid,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String message
) {}
