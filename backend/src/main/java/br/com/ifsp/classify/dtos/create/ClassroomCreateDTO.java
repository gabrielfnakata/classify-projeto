package br.com.ifsp.classify.dtos.create;

public record ClassroomCreateDTO(
        String name,
        Integer capacity,
        Boolean isDisabled
) {}