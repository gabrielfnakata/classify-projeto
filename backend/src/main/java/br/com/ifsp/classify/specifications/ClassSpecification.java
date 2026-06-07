package br.com.ifsp.classify.specifications;

import org.springframework.data.jpa.domain.Specification;

import br.com.ifsp.classify.utils.UuidUtils;

public class ClassSpecification {

    private static final String UUID = "uuid";

    public static Specification<br.com.ifsp.classify.models.Class> getByUUID(String uuid) {
        return (root, query, cb) ->
                cb.equal(root.get(UUID), UuidUtils.convertUUIDToBytes(uuid));
    }
}