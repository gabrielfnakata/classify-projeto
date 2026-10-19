package br.com.ifsp.classify.dtos.filter;

public record EmployeeFilterDTO(
    String name,
    String email,
    String cpf
) {}