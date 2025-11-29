package br.com.ifsp.classify.dtos;

public record SalaDTO(
        Integer id,
        String nome,
        Integer vagas,
        Integer capacidade,
        Boolean estaDisponivel
) {}