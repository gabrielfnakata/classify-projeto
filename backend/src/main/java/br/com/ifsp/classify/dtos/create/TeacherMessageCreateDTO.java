package br.com.ifsp.classify.dtos.create;

public record TeacherMessageCreateDTO(
        String sessionUuid,
        String subject,
        String message
) {
}
