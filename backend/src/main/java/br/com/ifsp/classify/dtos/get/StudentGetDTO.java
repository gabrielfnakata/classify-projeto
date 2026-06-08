package br.com.ifsp.classify.dtos.get;

import java.time.LocalDate;
import java.util.List;

public record StudentGetDTO(
        String uuid,
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
        List<GuardianGetDTO> guardians
) {}