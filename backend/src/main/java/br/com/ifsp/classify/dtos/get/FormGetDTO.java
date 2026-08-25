package br.com.ifsp.classify.dtos.get;

import br.com.ifsp.classify.models.form.FormStatus;

import java.time.LocalDate;

public record FormGetDTO(
            Long id,
            String title,
            String description,
            String teacherName,
            Integer questions,
            LocalDate createdAt,
            Boolean hasScore,
            FormStatus status
) {
}
