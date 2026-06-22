package br.com.ifsp.classify.dtos.get;

public record UserGetDTO(
    String uuid,
    String email,
    String refreshToken,
    RoleGetDTO role
) {}