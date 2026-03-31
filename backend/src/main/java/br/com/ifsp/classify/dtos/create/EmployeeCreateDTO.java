package br.com.ifsp.classify.dtos.create;

import java.time.LocalDate;

public record EmployeeCreateDTO(
        String name,
        String password,
        String cpf,
        LocalDate birthDate,
        String email,
        String telephone,
        String address,
        String roleId
) {}