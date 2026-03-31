package br.com.ifsp.classify.specifications;

import br.com.ifsp.classify.models.Subject;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.data.jpa.domain.Specification;

public class SubjectSpecification {

    private static final String UUID = "uuid";

    public static Specification<Subject> getByUUID(String uuid) {
        return (root, query, cb) ->
                cb.equal(root.get(UUID), UuidUtils.convertUUIDToBytes(uuid));
    }
}