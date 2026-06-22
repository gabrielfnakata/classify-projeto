package br.com.ifsp.classify.dtos.create;

public record UserCreateDTO(
    String email,
    String password,
    String roleId,
    String employeeUuid
) {}