package br.com.ifsp.classify.dtos.auth;

public record LoginResponseDTO(
        String accessToken,
        String refreshToken
) {}