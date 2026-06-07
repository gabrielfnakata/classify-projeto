package br.com.ifsp.classify.dtos.create;

import java.time.LocalDateTime;

public record ClassSessionCreateDTO(
        String subjectTeacherUuid,
        String classroomUuid,
        LocalDateTime startTime,
        LocalDateTime endTime,
        ReportCreateDTO report,
        String classUuid,
        String studentUuid
) {}