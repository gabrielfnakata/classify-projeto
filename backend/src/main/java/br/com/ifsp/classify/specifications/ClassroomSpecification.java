package br.com.ifsp.classify.specifications;

import br.com.ifsp.classify.models.Classroom;
import br.com.ifsp.classify.models.Classroom_;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.data.jpa.domain.Specification;

public class ClassroomSpecification {

    public static Specification<Classroom> getByUUID(String uuid) {
        return (root, query, cb) ->
                cb.equal(root.get(Classroom_.uuid), UuidUtils.convertUUIDToBytes(uuid));
    }

    public static Specification<Classroom> getByName(String name) {
        return (root, query, cb) ->
            cb.like(cb.upper(root.get(Classroom_.name)), "%" + name.trim().toUpperCase() + "%");
    }

    public static Specification<Classroom> getByCapacity(Integer capacity) {
        return (root, query, cb) ->
            cb.equal(root.get(Classroom_.capacity), capacity);
    }

    public static Specification<Classroom> getByDisponibility(Boolean isDisabled) {
        return (root, query, cb) ->
            cb.equal(root.get(Classroom_.isDisabled), isDisabled);
    }
}