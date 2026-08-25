package br.com.ifsp.classify.dtos.get;

public record FormAnswerGetDTO(
        Long id,
        Long questionId,
        Long optionId,
        String answerText,
        String teacherFeedback
) {
}
