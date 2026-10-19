package br.com.ifsp.classify.dtos.auth;

public record ResetPasswordRequestDTO(
        String token,
        String password,
        String confirmPassword
) {}
