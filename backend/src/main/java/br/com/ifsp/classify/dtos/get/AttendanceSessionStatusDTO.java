package br.com.ifsp.classify.dtos.get;

public record AttendanceSessionStatusDTO(
        String classSessionUuid,
        int totalStudents,
        int markedStudents
) {}
