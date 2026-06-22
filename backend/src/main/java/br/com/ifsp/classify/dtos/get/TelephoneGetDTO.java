package br.com.ifsp.classify.dtos.get;

public record TelephoneGetDTO(
    String country,
    String ddd,
    String number
) {}