package br.com.ifsp.classify.dtos.create;

public record AttendanceCreateDTO(
        String classSessionUuid,
        String studentUuid,
        String status,
        String justificationReason,
        String justificationNote
) {}
