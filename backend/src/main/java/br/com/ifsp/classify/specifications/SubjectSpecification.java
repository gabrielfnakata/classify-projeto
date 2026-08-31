package br.com.ifsp.classify.specifications;

import br.com.ifsp.classify.models.Subject;
import br.com.ifsp.classify.models.Subject_;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.data.jpa.domain.Specification;

public class SubjectSpecification {

    public static Specification<Subject> getByUUID(String uuid) {
        return (root, query, cb) ->
            cb.equal(root.get(Subject_.uuid), UuidUtils.convertUUIDToBytes(uuid));
    }

    public static Specification<Subject> getByDescription(String description) {
        return (root, query, cb) ->
            cb.like(cb.upper(root.get(Subject_.description)), "%" + description.trim().toUpperCase() + "%");
    }
}