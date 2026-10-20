package br.com.ifsp.classify.dtos.get;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import br.com.ifsp.classify.models.enums.RestoreStatus;

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
    String newData,
    @JsonInclude(JsonInclude.Include.NON_NULL) RestoreStatus restoreStatus
) {
    public AuditGetDTO withRestoreStatus(RestoreStatus restoreStatus) {
        return new AuditGetDTO(id, tableName, registerId, operation, userEmail, userUuid, userRole, date, oldData, newData, restoreStatus);
    }
}
