package br.com.ifsp.classify.dtos.auth;

public record LoginRequestDTO(
        String cpf,
        String password
) {}