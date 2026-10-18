package br.com.ifsp.classify.dtos.get;

import java.time.LocalDate;
import java.util.List;

public record ProfileGetDTO(
        String uuid,
        String name,
        String email,
        String cpf,
        LocalDate birthDate,
        LocalDate hireDate,
        RoleGetDTO role,
        List<TelephoneGetDTO> telephones
) {}
