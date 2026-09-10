package br.com.ifsp.classify.specifications;

import org.springframework.data.jpa.domain.Specification;

import br.com.ifsp.classify.models.Attendance;
import br.com.ifsp.classify.utils.UuidUtils;

public class AttendanceSpecification {

    private static final String UUID = "uuid";

    public static Specification<Attendance> getByUUID(String uuid) {
        return (root, query, cb) ->
                cb.equal(root.get(UUID), UuidUtils.convertUUIDToBytes(uuid));
    }

    public static Specification<Attendance> getByClassSessionId(Long classSessionId) {
        return (root, query, cb) ->
                cb.equal(root.get("classSession").get("id"), classSessionId);
    }

    public static Specification<Attendance> getBySessionAndStudent(Long classSessionId, Long studentId) {
        return (root, query, cb) -> cb.and(
                cb.equal(root.get("classSession").get("id"), classSessionId),
                cb.equal(root.get("student").get("id"), studentId)
        );
    }
}
