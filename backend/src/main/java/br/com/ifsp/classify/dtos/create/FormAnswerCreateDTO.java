package br.com.ifsp.classify.dtos.create;

public record FormAnswerCreateDTO(
        Long questionId,
        Long optionId,
        String answerText
) {
}
