package br.com.ifsp.classify.dtos.update;

import java.time.LocalDate;
import java.util.List;

public record StudentUpdateDTO(
        String name,
        LocalDate birthDate,
        String email,
        String cpf,
        LocalDate registrationDate,
        List<TelephoneUpdateDTO> telephones
) {}