package br.com.ifsp.classify.dtos.update;

public record ClassSessionStatusUpdateDTO(
        String status,
        String cancellationReason
) {}
