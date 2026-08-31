package br.com.ifsp.classify.specifications;

import org.springframework.data.jpa.domain.Specification;

import br.com.ifsp.classify.models.User;
import br.com.ifsp.classify.models.User_;
import br.com.ifsp.classify.utils.UuidUtils;

public class UserSpecification {

    public static Specification<User> getByUUID(String uuid) {
        return (root, query, cb) ->
                cb.equal(root.get(User_.uuid), UuidUtils.convertUUIDToBytes(uuid));
    }

    public static Specification<User> getByEmail(String email) {
        return (root, query, cb) ->
            cb.equal(cb.upper(root.get(User_.email)), email.trim().toUpperCase());
    }
}