package br.com.ifsp.classify.dtos.get;

public record AttendanceRosterEntryDTO(
        String studentUuid,
        String studentName,
        String attendanceUuid,
        String status,
        String justificationReason,
        String justificationNote
) {}
