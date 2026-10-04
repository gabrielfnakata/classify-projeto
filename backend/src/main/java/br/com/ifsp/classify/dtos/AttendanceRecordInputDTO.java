package br.com.ifsp.classify.dtos;

public record AttendanceRecordInputDTO(
        String studentUuid,
        String status,
        String justificationReason,
        String justificationNote
) {}
