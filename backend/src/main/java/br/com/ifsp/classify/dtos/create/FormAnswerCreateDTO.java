package br.com.ifsp.classify.dtos.create;

import java.util.List;

public record FormAnswerCreateDTO(
        String questionUuid,
        String optionUuid,
        String answerText,
        List<AnswerFileSubmissionDTO> answerFiles
) {
}
