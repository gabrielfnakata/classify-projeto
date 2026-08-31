package br.com.ifsp.classify.specifications;

import org.springframework.data.jpa.domain.Specification;

import br.com.ifsp.classify.models.Class_;
import br.com.ifsp.classify.utils.UuidUtils;

public class ClassSpecification {

    public static Specification<br.com.ifsp.classify.models.Class> getByUUID(String uuid) {
        return (root, query, cb) ->
                cb.equal(root.get(Class_.uuid), UuidUtils.convertUUIDToBytes(uuid));
    }
}