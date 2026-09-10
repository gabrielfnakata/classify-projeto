package br.com.ifsp.classify.dtos.get;

import java.util.List;

public record ClassGetDTO(
    String uuid,
    String name,
    String description,
    List<ClassStudentSummaryDTO> students
) {}