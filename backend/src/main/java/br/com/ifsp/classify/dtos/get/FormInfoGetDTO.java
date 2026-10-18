package br.com.ifsp.classify.dtos.get;

import java.util.List;

public record FormInfoGetDTO(
        String title,
        String description,
        List<FormQuestionGetDTO> questions
) {
}
