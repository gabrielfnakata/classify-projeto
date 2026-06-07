package br.com.ifsp.classify.dtos.create;

import java.util.List;

public record ClassCreateDTO(
    String name,
    String description,
    List<StudentCreateDTO> members
) {}