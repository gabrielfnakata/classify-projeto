package br.com.ifsp.classify.dtos.auth;

public record FirstAccessRequestDTO(
        String email,
        String password,
        String confirmPassword
) {}
