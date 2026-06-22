package br.com.ifsp.classify.dtos.create;

public record TelephoneCreateDTO(
    String country,
    String ddd,
    String number
) {}