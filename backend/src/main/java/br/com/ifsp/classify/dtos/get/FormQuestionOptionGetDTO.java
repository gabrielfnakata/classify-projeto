package br.com.ifsp.classify.dtos.get;

public record FormQuestionOptionGetDTO(
        Long id,
        String optionText,
        Boolean correct
) {
}
