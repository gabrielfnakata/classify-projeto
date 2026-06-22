package br.com.ifsp.classify.dtos.update;

import java.time.LocalDate;

public record EmployeeUpdateDTO(
    String name,
    LocalDate birthDate,
    String cpf,
    LocalDate hireDate,
    UserUpdateDTO user
) {}