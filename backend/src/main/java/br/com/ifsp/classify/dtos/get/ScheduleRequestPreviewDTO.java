package br.com.ifsp.classify.dtos.get;

import java.time.LocalDateTime;

public record ScheduleRequestPreviewDTO(
        String studentName,
        String teacherName,
        String subjectName,
        LocalDateTime startTime,
        LocalDateTime endTime
) {}
