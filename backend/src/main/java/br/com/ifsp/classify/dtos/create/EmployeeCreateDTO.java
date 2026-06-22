package br.com.ifsp.classify.dtos.create;

import java.time.LocalDate;
import java.util.List;

public record EmployeeCreateDTO(
        String name,
        LocalDate birthDate,
        String cpf,
        LocalDate hireDate,
        UserCreateDTO user,
        List<TelephoneCreateDTO> telephones
) {}