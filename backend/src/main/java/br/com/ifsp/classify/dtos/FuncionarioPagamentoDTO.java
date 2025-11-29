package br.com.ifsp.classify.dtos;

public record FuncionarioPagamentoDTO(
        Long id,
        TipoPagamentoDTO tipoPagamentoDTO,
        FuncionarioDTO funcionarioDTO
) {}