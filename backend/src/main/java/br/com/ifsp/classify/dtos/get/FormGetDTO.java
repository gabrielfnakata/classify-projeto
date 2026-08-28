package br.com.ifsp.classify.dtos.get;

import br.com.ifsp.classify.models.form.FormStatus;

import java.time.LocalDate;

public record FormGetDTO(
            String id,
            String title,
            String description,
            String teacherName,
            Integer questions,
            LocalDate createdAt,
            LocalDate limitDate,
            Boolean hasScore,
            Float score,
            FormStatus status
) {
}
