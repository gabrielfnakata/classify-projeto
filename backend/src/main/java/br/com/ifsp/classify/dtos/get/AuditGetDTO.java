package br.com.ifsp.classify.dtos.get;

import java.time.LocalDateTime;

public record AuditGetDTO(
    Long id,
    String tableName,
    Long registerId,
    String operation,
    String userEmail,
    String userUuid,
    String userRole,
    LocalDateTime date,
    String oldData,
    String newData
) {}
