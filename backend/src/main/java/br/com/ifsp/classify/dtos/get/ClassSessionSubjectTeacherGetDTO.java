package br.com.ifsp.classify.dtos.get;

public record ClassSessionSubjectTeacherGetDTO(
        String uuidEmployee,
        String employee,
        String uuidSubject,
        String subject
) {}