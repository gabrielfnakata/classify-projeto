package br.com.ifsp.classify.dtos.get;

import java.time.LocalDateTime;

public record ClassSessionGetDTO(
        String uuid,
        SubjectTeacherGetDTO subjectTeacher,
        String classroomUuid,
        LocalDateTime startTime,
        LocalDateTime endTime,
        ReportGetDTO report,
        ClassSummaryDTO classDTO,
        StudentGetDTO student,
        String recurrenceGroupUuid,
        String status,
        String cancellationReason
) {}