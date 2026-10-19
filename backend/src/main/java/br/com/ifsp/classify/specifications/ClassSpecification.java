package br.com.ifsp.classify.specifications;

import org.springframework.data.jpa.domain.Specification;

import br.com.ifsp.classify.models.Class_;
import br.com.ifsp.classify.utils.UuidUtils;

public class ClassSpecification {

    public static Specification<br.com.ifsp.classify.models.Class> getByUUID(String uuid) {
        return (root, query, cb) ->
                cb.equal(root.get(Class_.uuid), UuidUtils.convertUUIDToBytes(uuid));
    }

    public static Specification<br.com.ifsp.classify.models.Class> getByName(String name) {
        return (root, query, cb) ->
                cb.like(cb.lower(root.get(Class_.name)), "%" + name.toLowerCase() + "%");
    }

    public static Specification<br.com.ifsp.classify.models.Class> getByDescription(String description) {
        return (root, query, cb) ->
                cb.like(cb.lower(root.get(Class_.description)), "%" + description.toLowerCase() + "%");
    }
}