package br.com.ifsp.classify.dtos.create;

public record FormQuestionOptionCreateDTO(
        String optionText,
        Boolean isCorrect
) {
}
