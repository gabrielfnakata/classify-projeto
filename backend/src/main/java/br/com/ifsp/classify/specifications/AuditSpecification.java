package br.com.ifsp.classify.specifications;

import br.com.ifsp.classify.models.Audit;
import br.com.ifsp.classify.utils.Utils;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class AuditSpecification {

    private static final String TABLE_NAME = "tableName";
    private static final String REGISTER_ID = "registerId";
    private static final String OPERATION = "operation";
    private static final String DATE = "date";

    public static Specification<Audit> hasTableName(String tableName) {
        return (root, query, cb) -> {
            if (Utils.isNullOrEmpty(tableName)) return null;
            return cb.equal(root.get(TABLE_NAME), tableName.trim().toUpperCase());
        };
    }

    public static Specification<Audit> hasRegisterId(Long registerId) {
        return (root, query, cb) -> {
            if (registerId == null) return null;
            return cb.equal(root.get(REGISTER_ID), registerId);
        };
    }

    public static Specification<Audit> hasOperation(String operation) {
        return (root, query, cb) -> {
            if (Utils.isNullOrEmpty(operation)) return null;
            return cb.equal(root.get(OPERATION), operation.trim().toUpperCase());
        };
    }

    public static Specification<Audit> dateBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, cb) -> {
            if (startDate != null && endDate != null) {
                return cb.between(root.get(DATE), startDate, endDate);
            } else if (startDate != null) {
                return cb.greaterThanOrEqualTo(root.get(DATE), startDate);
            } else if (endDate != null) {
                return cb.lessThanOrEqualTo(root.get(DATE), endDate);
            }
            return null;
        };
    }
}
