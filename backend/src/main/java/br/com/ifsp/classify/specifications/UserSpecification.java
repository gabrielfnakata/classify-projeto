package br.com.ifsp.classify.specifications;

import org.springframework.data.jpa.domain.Specification;

import br.com.ifsp.classify.models.User;
import br.com.ifsp.classify.utils.UuidUtils;

public class UserSpecification {

    private static final String EMAIL = "email";
    private static final String UUID = "uuid";

    public static Specification<User> getByUUID(String uuid) {
        return (root, query, cb) ->
                cb.equal(root.get(UUID), UuidUtils.convertUUIDToBytes(uuid));
    }

    public static Specification<User> getByEmail(String email) {
        return (root, query, cb) ->
                cb.equal(root.get(EMAIL), email.trim());
    }
}