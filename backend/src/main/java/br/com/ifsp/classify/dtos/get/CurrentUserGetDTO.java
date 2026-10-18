package br.com.ifsp.classify.dtos.get;

public record CurrentUserGetDTO(
        String name,
        String email,
        RoleGetDTO role
) {}
