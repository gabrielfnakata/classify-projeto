package br.com.ifsp.classify.dtos;

import java.time.LocalDate;

public record AlunoDTO(
        Long id,
        String nome,
        LocalDate dataNascimento,
        LocalDate dataMatricula,
        String email,
        String telefone,
        String endereco,
        String nomeResponsavel,
        String telefoneResponsavel
) {}