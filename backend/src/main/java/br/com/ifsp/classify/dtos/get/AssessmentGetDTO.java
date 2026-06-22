package br.com.ifsp.classify.dtos.get;

public record AssessmentGetDTO(
    String description,
    String grade,
    String observation
) {}