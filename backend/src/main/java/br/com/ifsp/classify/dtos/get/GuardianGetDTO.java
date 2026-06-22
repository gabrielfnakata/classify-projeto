package br.com.ifsp.classify.dtos.get;

public record GuardianGetDTO(
        String uuid,
        String name,
        String cpf,
        String email,
        AddressGetDTO address
) {}