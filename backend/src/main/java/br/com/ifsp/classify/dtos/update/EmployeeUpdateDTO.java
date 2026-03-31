package br.com.ifsp.classify.dtos.update;

import java.time.LocalDate;

public record EmployeeUpdateDTO(
    String name,
    LocalDate birthDate,
    String email,
    String telephone,
    String address,
    String cpf,
    String roleId
) {}