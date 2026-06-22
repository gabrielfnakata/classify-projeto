package br.com.ifsp.classify.dtos.create;

public record AssessmentCreateDTO(
    String description,
    String grade,
    String observation
) {}