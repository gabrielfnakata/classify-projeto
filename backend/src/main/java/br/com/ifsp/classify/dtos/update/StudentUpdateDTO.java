package br.com.ifsp.classify.dtos.update;

import java.time.LocalDate;

public record StudentUpdateDTO(
        String name,
        LocalDate birthDate,
        LocalDate registrationDate,
        String email,
        String telephone,
        String address,
        String neighborhood,
        String school,
        Integer grade,
        Boolean referral,
        String referrerName
) {}