package br.com.ifsp.classify.dtos.get;

public record AttendanceGetDTO(
        String uuid,
        String classSessionUuid,
        String studentUuid,
        String studentName,
        String status,
        String justificationReason,
        String justificationNote
) {}
