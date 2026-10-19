package br.com.ifsp.classify.specifications;

import br.com.ifsp.classify.models.TeacherAvailability;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.data.jpa.domain.Specification;

public class TeacherAvailabilitySpecification {

    private static final String UUID = "uuid";

    public static Specification<TeacherAvailability> getByUUID(String uuid) {
        return (root, query, cb) ->
                cb.equal(root.get(UUID), UuidUtils.convertUUIDToBytes(uuid));
    }

    public static Specification<TeacherAvailability> getByEmployeeId(Long employeeId) {
        return (root, query, cb) ->
                cb.equal(root.get("employee").get("id"), employeeId);
    }
}
