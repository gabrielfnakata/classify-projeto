package br.com.ifsp.classify.dtos.create;

import br.com.ifsp.classify.models.form.AnswerType;

import java.util.List;

public record FormQuestionCreateDTO(
        String question,
        AnswerType answerType,
        Boolean isRequired,
        List<FormQuestionOptionCreateDTO> options
) {
}
