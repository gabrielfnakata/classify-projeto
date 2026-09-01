package br.com.ifsp.classify.dtos.update;

public record FormAnswerCorrectionDTO(
        String uuid,
        String feedback,
        Boolean correct
) {
}
