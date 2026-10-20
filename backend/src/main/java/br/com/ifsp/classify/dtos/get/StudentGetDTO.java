package br.com.ifsp.classify.dtos.get;

import com.fasterxml.jackson.annotation.JsonInclude;

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
        List<TelephoneGetDTO> telephones,
        @JsonInclude(JsonInclude.Include.NON_NULL) Boolean welcomeEmailSent
) {
    public StudentGetDTO withWelcomeEmailSent(Boolean sent) {
        return new StudentGetDTO(uuid, name, birthDate, email, cpf, registrationDate, guardians, telephones, sent);
    }
}
