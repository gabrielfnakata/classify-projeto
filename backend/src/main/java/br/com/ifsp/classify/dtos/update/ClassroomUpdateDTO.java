package br.com.ifsp.classify.dtos.update;

public record ClassroomUpdateDTO(
    String name,
    Integer capacity,
    Boolean isDisabled
) {}