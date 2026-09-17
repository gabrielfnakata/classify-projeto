package br.com.ifsp.classify.dtos.update;

public record AttendanceUpdateDTO(
        String status,
        String justificationReason,
        String justificationNote
) {}
