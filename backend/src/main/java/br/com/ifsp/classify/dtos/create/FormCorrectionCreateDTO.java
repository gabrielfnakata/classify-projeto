package br.com.ifsp.classify.dtos.create;

import java.util.List;

public record FormCorrectionCreateDTO(
        String formSubmissionUuid,
        List<FormFeedbackCreateDTO> formFeedbacks,
        Float score
) {
}
