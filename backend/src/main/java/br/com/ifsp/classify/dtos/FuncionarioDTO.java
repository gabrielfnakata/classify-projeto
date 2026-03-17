package br.com.ifsp.classify.dtos;

import java.time.LocalDate;

public record FuncionarioDTO(
        Long id,
        String nome,
        String cpf,
        LocalDate dataNascimento,
        String email,
        String telefone,
        String endereco,
        CargoDTO cargoDTO
) {}