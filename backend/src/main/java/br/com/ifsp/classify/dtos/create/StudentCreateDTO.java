package br.com.ifsp.classify.dtos.create;

import java.time.LocalDate;

public record StudentCreateDTO(
        String name,
        LocalDate birthDate,
        LocalDate registrationDate,
        String email,
        String telephone,
        String address,
        GuardianCreateDTO[] guardians
) {}