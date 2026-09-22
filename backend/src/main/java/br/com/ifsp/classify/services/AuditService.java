package br.com.ifsp.classify.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import br.com.ifsp.classify.dtos.get.AuditGetDTO;
import br.com.ifsp.classify.models.Audit;
import br.com.ifsp.classify.models.User;
import br.com.ifsp.classify.repositories.AuditRepository;
import br.com.ifsp.classify.repositories.UserRepository;
import br.com.ifsp.classify.specifications.AuditSpecification;
import br.com.ifsp.classify.specifications.UserSpecification;
import br.com.ifsp.classify.utils.UuidUtils;

@Service
public class AuditService {

    private final AuditRepository auditRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public AuditService(AuditRepository auditRepository, UserRepository userRepository) {
        this.auditRepository = auditRepository;
        this.userRepository = userRepository;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        this.objectMapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
    }

    public AuditGetDTO returnDTO(Audit audit) {
        if (audit == null)
            return null;

        String userEmail = audit.getUser() != null ? audit.getUser().getEmail() : null;
        String userUuid = (audit.getUser() != null && audit.getUser().getUuid() != null)
                ? UuidUtils.convertBytesToString(audit.getUser().getUuid())
                : null;

        return new AuditGetDTO(
                audit.getId(),
                audit.getTableName(),
                audit.getRegisterId(),
                audit.getOperation(),
                userEmail,
                userUuid,
                audit.getDate(),
                audit.getOldData(),
                audit.getNewData()
        );
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logInsert(String tableName, Long registerId, Object newData) {
        log(tableName, registerId, "INSERT", null, newData);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logUpdate(String tableName, Long registerId, Object oldData, Object newData) {
        log(tableName, registerId, "UPDATE", oldData, newData);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logDelete(String tableName, Long registerId, Object oldData) {
        log(tableName, registerId, "DELETE", oldData, "{\"deleted\":true}");
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String tableName, Long registerId, String operation, Object oldData, Object newData) {
        if (tableName == null || registerId == null || operation == null) {
            return;
        }

        User currentUser = resolveCurrentUser();
        if (currentUser == null) {
            return;
        }

        String oldJson = toJson(oldData);
        String newJson = toJson(newData);

        if (newJson == null) {
            newJson = "{}";
        }

        if ("UPDATE".equalsIgnoreCase(operation) && oldJson != null && oldJson.equals(newJson)) {
            return;
        }

        Audit audit = new Audit();
        audit.setTableName(tableName.trim().toUpperCase());
        audit.setRegisterId(registerId);
        audit.setOperation(operation.trim().toUpperCase());
        audit.setUser(currentUser);
        audit.setDate(LocalDateTime.now());
        audit.setOldData(oldJson);
        audit.setNewData(newJson);

        auditRepository.save(audit);
    }

    public List<AuditGetDTO> findByTableNameAndRegisterId(String tableName, Long registerId) {
        if (tableName == null || registerId == null)
            return List.of();

        return auditRepository.findByTableNameAndRegisterIdOrderByDateDesc(tableName.trim().toUpperCase(), registerId)
                .stream()
                .map(this::returnDTO)
                .collect(Collectors.toList());
    }

    public List<AuditGetDTO> findByTableName(String tableName) {
        if (tableName == null)
            return List.of();

        return auditRepository.findByTableNameOrderByDateDesc(tableName.trim().toUpperCase())
                .stream()
                .map(this::returnDTO)
                .collect(Collectors.toList());
    }

    public List<AuditGetDTO> findAll(String tableName, Long registerId, String operation, LocalDateTime startDate, LocalDateTime endDate) {
        Specification<Audit> spec = Specification.allOf(
                AuditSpecification.hasTableName(tableName),
                AuditSpecification.hasRegisterId(registerId),
                AuditSpecification.hasOperation(operation),
                AuditSpecification.dateBetween(startDate, endDate)
        );

        return auditRepository.findAll(spec)
                .stream()
                .map(this::returnDTO)
                .sorted((a, b) -> b.date().compareTo(a.date()))
                .collect(Collectors.toList());
    }

    private User resolveCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
            String email = auth.getName();
            User user = userRepository.findOne(UserSpecification.getByEmail(email)).orElse(null);
            if (user != null) {
                return user;
            }
        }

        return userRepository.findAll().stream().findFirst().orElse(null);
    }

    private String toJson(Object object) {
        if (object == null)
            return null;

        if (object instanceof String str) {
            String trimmed = str.trim();
            if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
                return trimmed;
            }
        }

        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            return "{\"error\":\"Serialization error: " + e.getMessage().replace("\"", "'") + "\"}";
        }
    }
}
