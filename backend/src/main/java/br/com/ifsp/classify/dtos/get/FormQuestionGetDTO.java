package br.com.ifsp.classify.dtos.get;

import br.com.ifsp.classify.models.form.AnswerType;

import java.util.List;

public record FormQuestionGetDTO(
        String uuid,
        String formUuid,
        String question,
        AnswerType answerType,
        List<FormQuestionOptionGetDTO> options
) {
}
