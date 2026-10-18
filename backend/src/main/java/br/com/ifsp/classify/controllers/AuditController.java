package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.get.AuditGetDTO;
import br.com.ifsp.classify.services.AuditService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/audit")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<List<AuditGetDTO>> findAll(
            @RequestParam(required = false) String tableName,
            @RequestParam(required = false) Long registerId,
            @RequestParam(required = false) String operation,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<AuditGetDTO> logs = auditService.findAll(tableName, registerId, operation, startDate, endDate);
        return logs.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(logs);
    }

    @GetMapping("/{tableName}")
    public ResponseEntity<List<AuditGetDTO>> findByTableName(@PathVariable String tableName) {
        List<AuditGetDTO> logs = auditService.findByTableName(tableName);
        return logs.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(logs);
    }

    @GetMapping("/{tableName}/{registerId}")
    public ResponseEntity<List<AuditGetDTO>> findByTableNameAndRegisterId(
            @PathVariable String tableName,
            @PathVariable Long registerId) {

        List<AuditGetDTO> logs = auditService.findByTableNameAndRegisterId(tableName, registerId);
        return logs.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(logs);
    }
}
