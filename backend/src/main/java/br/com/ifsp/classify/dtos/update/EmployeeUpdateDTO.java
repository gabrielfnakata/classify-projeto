package br.com.ifsp.classify.dtos.update;

import br.com.ifsp.classify.dtos.create.TelephoneCreateDTO;

import java.time.LocalDate;
import java.util.List;

public record EmployeeUpdateDTO(
    String name,
    LocalDate birthDate,
    String cpf,
    LocalDate hireDate,
    UserUpdateDTO user,
    List<TelephoneCreateDTO> telephones
) {}