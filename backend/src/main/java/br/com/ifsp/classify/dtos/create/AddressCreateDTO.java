package br.com.ifsp.classify.dtos.create;

public record AddressCreateDTO(
    String zipCode,
    String street,
    String number,
    String complement,
    String neighborhood,
    String city,
    String state
) {}