package br.com.ifsp.classify.dtos.create;

public record FormFeedbackCreateDTO(
        String questionUuid,
        String teacherFeedback,
        Boolean correct
) {
}
