package br.com.ifsp.classify.dtos.create;

import java.util.List;

public record GuardianCreateDTO(
        String name,
        String cpf,
        String email,
        List<TelephoneCreateDTO> telephones,
        AddressCreateDTO address
) {}