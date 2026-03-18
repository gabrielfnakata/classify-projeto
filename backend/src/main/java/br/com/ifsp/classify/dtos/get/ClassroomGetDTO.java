package br.com.ifsp.classify.dtos.get;

public record ClassroomGetDTO(
        String uuid,
        String name,
        Integer capacity,
        Boolean isDisabled
) {}