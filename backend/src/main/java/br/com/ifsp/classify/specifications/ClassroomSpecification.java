package br.com.ifsp.classify.specifications;

import br.com.ifsp.classify.models.Classroom;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.data.jpa.domain.Specification;

public class ClassroomSpecification {

    private static final String UUID = "uuid";
    private static final String NAME = "name";
    private static final String CAPACITY = "capacity";
    private static final String DISABLED = "isDisabled";

    public static Specification<Classroom> getByUUID(String uuid) {
        return (root, query, cb) ->
                cb.equal(root.get(UUID), UuidUtils.convertUUIDToBytes(uuid));
    }

    public static Specification<Classroom> getByName(String name) {
        return (root, query, cb) ->
            cb.like(cb.upper(root.get(NAME)), "%" + name.trim().toUpperCase() + "%");
    }

    public static Specification<Classroom> getByCapacity(Integer capacity) {
        return (root, query, cb) ->
            cb.equal(root.get(CAPACITY), capacity);
    }

    public static Specification<Classroom> getByDisponibility(Boolean isDisabled) {
        return (root, query, cb) ->
            cb.equal(root.get(DISABLED), isDisabled);
    }
}