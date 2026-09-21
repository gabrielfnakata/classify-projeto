package br.com.ifsp.classify.dtos.get;

import java.util.List;

/**
 * Resultado de uma operação em lote: quantas deram certo e o motivo de cada falha.
 * Uma aula que falha não impede as outras, igual ao que a tela fazia com N requisições.
 */
public record BatchResultDTO(
        int applied,
        List<BatchFailureDTO> failures
) {
    public record BatchFailureDTO(
            String uuid,
            String message
    ) {}
}
