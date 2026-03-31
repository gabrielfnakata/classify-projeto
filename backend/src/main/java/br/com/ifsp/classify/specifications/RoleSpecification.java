package br.com.ifsp.classify.specifications;

import br.com.ifsp.classify.models.Role;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.data.jpa.domain.Specification;

public class RoleSpecification {

    private static final String UUID = "uuid";

    public static Specification<Role> getByUUID(String uuid) {
        return (root, query, cb) ->
                cb.equal(root.get(UUID), UuidUtils.convertUUIDToBytes(uuid));
    }
}