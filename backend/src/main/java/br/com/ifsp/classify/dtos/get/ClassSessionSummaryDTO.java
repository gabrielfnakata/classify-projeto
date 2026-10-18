package br.com.ifsp.classify.dtos.get;

/**
 * Contagem de aulas por chave (disciplina, professor, sala ou turma), para as listagens
 * mostrarem o resumo sem baixar a agenda inteira.
 */
public record ClassSessionSummaryDTO(
        String uuid,
        long upcoming,
        long today
) {}
