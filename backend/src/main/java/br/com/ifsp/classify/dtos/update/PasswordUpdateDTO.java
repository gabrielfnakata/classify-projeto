package br.com.ifsp.classify.dtos.update;

public record PasswordUpdateDTO(
    String currentPassword,
    String newPassword
) {}
