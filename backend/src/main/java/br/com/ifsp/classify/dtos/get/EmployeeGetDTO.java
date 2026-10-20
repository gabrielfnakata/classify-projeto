package br.com.ifsp.classify.dtos.get;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDate;
import java.util.List;

public record EmployeeGetDTO(
        String uuid,
        String name,
        LocalDate birthDate,
        String cpf,
        LocalDate hireDate,
        List<TelephoneGetDTO> telephones,
        String userUuid,
        String email,
        String roleId,
        String roleDescription,
        @JsonInclude(JsonInclude.Include.NON_NULL) Boolean welcomeEmailSent
) {
    public EmployeeGetDTO withWelcomeEmailSent(Boolean sent) {
        return new EmployeeGetDTO(uuid, name, birthDate, cpf, hireDate, telephones, userUuid, email, roleId, roleDescription, sent);
    }
}
