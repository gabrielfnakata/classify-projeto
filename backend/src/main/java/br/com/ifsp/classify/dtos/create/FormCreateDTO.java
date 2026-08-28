package br.com.ifsp.classify.dtos.create;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.List;

public record FormCreateDTO(
    @NotBlank String title,
    @NotBlank String description,
    @JsonFormat(pattern = "yyyy-MM-dd") LocalDateTime limitDate,
    List<FormQuestionCreateDTO> questions
) {
}
