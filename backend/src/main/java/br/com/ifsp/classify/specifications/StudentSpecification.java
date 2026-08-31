package br.com.ifsp.classify.specifications;

import br.com.ifsp.classify.models.Student;
import br.com.ifsp.classify.models.Student_;
import br.com.ifsp.classify.models.Telephone;
import br.com.ifsp.classify.models.Telephone_;
import br.com.ifsp.classify.utils.UuidUtils;
import jakarta.persistence.criteria.Join;

import org.springframework.data.jpa.domain.Specification;

public class StudentSpecification {

    public static Specification<Student> getByUUID(String uuid) {
        return (root, query, cb) ->
                cb.equal(root.get(Student_.uuid), UuidUtils.convertUUIDToBytes(uuid));
    }

    public static Specification<Student> getByCpf(String cpf) {
        return (root, query, cb) ->
            cb.like(root.get(Student_.cpf), "%" + cpf.trim() + "%");
    }

    public static Specification<Student> getByName(String name) {
        return (root, query, cb) ->
            cb.like(cb.upper(root.get(Student_.name)), "%" + name.trim().toUpperCase() + "%");
    }

    public static Specification<Student> getByEmail(String email) {
        return (root, query, cb) ->
            cb.like(cb.upper(root.get(EMAIL)), "%" + email.trim().toUpperCase() + "%");
    }
}