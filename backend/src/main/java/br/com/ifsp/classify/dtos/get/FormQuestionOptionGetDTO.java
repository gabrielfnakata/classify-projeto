package br.com.ifsp.classify.dtos.get;

public record FormQuestionOptionGetDTO(
        String uuid,
        String optionText,
        Boolean correct
) {
}
