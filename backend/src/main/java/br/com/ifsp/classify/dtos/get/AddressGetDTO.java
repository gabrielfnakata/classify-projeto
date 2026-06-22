package br.com.ifsp.classify.dtos.get;

public record AddressGetDTO(
    String zipCode,
    String street,
    String number,
    String complement,
    String neighborhood,
    String city,
    String state
) {}