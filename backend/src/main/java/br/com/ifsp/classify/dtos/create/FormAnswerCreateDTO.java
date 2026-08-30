package br.com.ifsp.classify.dtos.create;

public record FormAnswerCreateDTO(
        String questionUuid,
        String optionUuid,
        String answerText
) {
}
