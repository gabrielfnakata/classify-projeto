package br.com.ifsp.classify.dtos;

public record ProfessorDisciplinaDTO(
        Long id,
        FuncionarioDTO funcionarioDTO,
        DisciplinaDTO disciplinaDTO
) {}