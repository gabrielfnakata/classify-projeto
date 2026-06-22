package br.com.ifsp.classify.dtos.get;

import java.time.LocalDate;
import java.util.List;

public record StudentGetDTO(
        String uuid,
        String name,
        LocalDate birthDate,
        String email,
        String cpf,
        LocalDate registrationDate,
        List<GuardianGetDTO> guardians,
        List<TelephoneGetDTO> telephones
) {}