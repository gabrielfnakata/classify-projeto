package br.com.ifsp.classify.dtos.create;

import java.util.List;

public record FormSubmissionCreateDTO(
        Long formId,
        Long studentId,
        List<FormAnswerCreateDTO> answers
) {
}
