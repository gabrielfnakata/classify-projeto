package br.com.ifsp.classify.dtos.get;

import java.time.LocalDate;
import java.util.List;

public record EmployeeGetDTO(
        String uuid,
        String name,
        LocalDate birthDate,
        String cpf,
        LocalDate hireDate,
        String email,
        String roleId,
        List<TelephoneGetDTO> telephones,
        String userUuid
) {}