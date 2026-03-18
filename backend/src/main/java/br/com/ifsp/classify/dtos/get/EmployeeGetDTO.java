package br.com.ifsp.classify.dtos.get;

import java.time.LocalDate;

public record EmployeeGetDTO(
        String uuid,
        String name,
        String cpf,
        LocalDate birthDate,
        String email,
        String telephone,
        String address,
        RoleGetDTO role
) {}