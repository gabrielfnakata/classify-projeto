package br.com.ifsp.classify.dtos.update;

public record TelephoneUpdateDTO(
    String country,
    String ddd,
    String number,
    Boolean isDeleted
) {
}