package br.com.ifsp.classify.dtos;

import java.time.LocalDateTime;

public record AulaDTO(
        Long id,
        ProfessorDisciplinaDTO professorDisciplinaDTO,
        SalaDTO salaDTO,
        LocalDateTime horarioInicio,
        LocalDateTime horarioFim
) {}