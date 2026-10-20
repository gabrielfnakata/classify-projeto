package br.com.ifsp.classify.dtos.create;

import java.util.List;

public record FormSubmissionCreateDTO(
        String formId,
        String studentId,
        List<FormAnswerCreateDTO> answers
) {
}
