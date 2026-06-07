package br.com.ifsp.classify.dtos.update;

import java.util.List;

public record GuardianUpdateDTO(
        String name,
        String cpf,
        String email,
        List<TelephoneUpdateDTO> telephone
) {}