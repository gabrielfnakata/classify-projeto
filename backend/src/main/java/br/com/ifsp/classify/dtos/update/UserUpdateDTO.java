package br.com.ifsp.classify.dtos.update;

public record UserUpdateDTO(
    String email,
    String password,
    String roleId
) {}