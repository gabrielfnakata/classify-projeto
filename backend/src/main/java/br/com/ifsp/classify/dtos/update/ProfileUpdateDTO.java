package br.com.ifsp.classify.dtos.update;

import java.time.LocalDate;

import br.com.ifsp.classify.dtos.create.TelephoneCreateDTO;

public record ProfileUpdateDTO(
    String name,
    LocalDate birthDate,
    TelephoneCreateDTO telephone
) {}
