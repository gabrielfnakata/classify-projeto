package br.com.ifsp.classify.dtos.create;

import java.time.LocalDate;
import java.util.List;

public record StudentCreateDTO(
        String name,
        LocalDate birthDate,
        String email,
        String cpf,
        LocalDate registrationDate,
        List<TelephoneCreateDTO> telephones,
        List<GuardianCreateDTO> guardians
) {}