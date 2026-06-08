package br.com.ifsp.classify.dtos.create;

import java.time.LocalDate;
import java.util.List;

public record StudentCreateDTO(
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
        String referrerName,
        List<GuardianCreateDTO> guardians
) {}