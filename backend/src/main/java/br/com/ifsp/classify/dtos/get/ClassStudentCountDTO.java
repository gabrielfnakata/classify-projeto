package br.com.ifsp.classify.dtos.get;

import java.time.LocalDateTime;

public record ClassStudentCountDTO(
    LocalDateTime date,
    Integer studentCount
) {}
