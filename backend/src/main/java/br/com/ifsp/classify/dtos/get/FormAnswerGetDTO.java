package br.com.ifsp.classify.dtos.get;

public record FormAnswerGetDTO(
        String uuid,
        String questionUuid,
        String optionUuid,
        String answerText,
        String answerFileUrl,
        String teacherFeedback,
        Boolean correct
) {
}
