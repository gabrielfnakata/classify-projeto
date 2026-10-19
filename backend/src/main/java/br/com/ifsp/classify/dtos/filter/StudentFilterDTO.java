package br.com.ifsp.classify.dtos.filter;

public record StudentFilterDTO(
    String name,
    String email,
    String cpf,
    String telephone
) {}