package br.com.ifsp.classify.dtos.update;

import java.util.List;

public record ClassSessionBatchStatusDTO(
        List<String> uuids,
        String status,
        String cancellationReason
) {}
