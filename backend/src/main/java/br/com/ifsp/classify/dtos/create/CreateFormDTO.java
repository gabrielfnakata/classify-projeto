package br.com.ifsp.classify.dtos.create;

import java.time.LocalDateTime;
import java.util.List;

public record CreateFormDTO(
    String title,
    String description,
    LocalDateTime limitDate,
    List<FormQuestionCreateDTO> questions
) {
}
