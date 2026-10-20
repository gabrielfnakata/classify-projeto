package br.com.ifsp.classify.dtos.get;

/** Só o necessário para montar uma lista de escolha (ex.: alunos no agendamento), sem dados pessoais. */
public record OptionGetDTO(
    String uuid,
    String name
) {}
