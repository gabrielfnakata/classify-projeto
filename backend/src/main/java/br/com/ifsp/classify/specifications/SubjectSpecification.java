package br.com.ifsp.classify.specifications;

import br.com.ifsp.classify.models.Subject;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.data.jpa.domain.Specification;

public class SubjectSpecification {

    private static final String UUID = "uuid";
    private static final String DESCRIPTION = "description";

    public static Specification<Subject> getByUUID(String uuid) {
        return (root, query, cb) ->
            cb.equal(root.get(UUID), UuidUtils.convertUUIDToBytes(uuid));
    }

    public static Specification<Subject> getByDescription(String description) {
        return (root, query, cb) ->
            cb.like(cb.upper(root.get(DESCRIPTION)), description.trim().toUpperCase());
    }
}