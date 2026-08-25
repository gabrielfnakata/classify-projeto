package br.com.ifsp.classify.dtos.get;

import br.com.ifsp.classify.models.form.FormStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record FormSubmissionGetDTO(
        Long id,
        Long formId,
        Long studentId,
        List<FormAnswerGetDTO> answers,
        FormStatus status,
        LocalDateTime startedAt,
        LocalDateTime submittedAt,
        LocalDateTime correctedAt,
        BigDecimal score
) {
}
