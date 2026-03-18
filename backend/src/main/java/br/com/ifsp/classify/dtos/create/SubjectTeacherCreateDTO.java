package br.com.ifsp.classify.dtos.create;

public record SubjectTeacherCreateDTO(
        Byte[] employeeId,
        Byte[] subjectId
) {}