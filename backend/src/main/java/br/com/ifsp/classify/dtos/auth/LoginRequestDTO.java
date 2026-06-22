package br.com.ifsp.classify.dtos.auth;

public record LoginRequestDTO(
        String email,
        String password
) {}