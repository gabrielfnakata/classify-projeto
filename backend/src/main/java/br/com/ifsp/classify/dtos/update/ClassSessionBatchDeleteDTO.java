package br.com.ifsp.classify.dtos.update;

import java.util.List;

public record ClassSessionBatchDeleteDTO(
        List<String> uuids
) {}
