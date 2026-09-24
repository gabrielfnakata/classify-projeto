package br.com.ifsp.classify.dtos.get;

/**
 * Turma vista de dentro de uma aula: identificação e quantos alunos tem.
 * A lista completa de alunos fica no ClassGetDTO, usado pelas telas de turma.
 */
public record ClassSummaryDTO(
    String uuid,
    String name,
    String description,
    int studentCount
) {}
