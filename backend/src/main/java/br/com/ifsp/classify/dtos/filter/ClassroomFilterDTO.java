package br.com.ifsp.classify.dtos.filter;

public record ClassroomFilterDTO(
    String name,
    Integer capacity,
    Boolean isDisabled
) {}