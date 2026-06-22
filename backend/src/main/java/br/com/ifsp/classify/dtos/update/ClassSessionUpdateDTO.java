package br.com.ifsp.classify.dtos.update;

import java.time.LocalDateTime;

public record ClassSessionUpdateDTO(
    String subjectTeacherId,
    String classroomUuid,
    LocalDateTime startTime,
    LocalDateTime endTime,
    ReportUpdateDTO report,
    String classUuid,
    String studentUuid
) {}