package br.com.ifsp.classify.dtos.create;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record FormCreateDTO(
    @NotBlank String title,
    @NotBlank String description,
    @JsonFormat(pattern = "yyyy-MM-dd") LocalDate limitDate,
    @Size(min = 1) List<FormQuestionCreateDTO> questions
) {
}
