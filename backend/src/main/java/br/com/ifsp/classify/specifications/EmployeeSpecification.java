package br.com.ifsp.classify.specifications;

import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.models.Employee_;
import br.com.ifsp.classify.models.User_;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.data.jpa.domain.Specification;

public class EmployeeSpecification {

    public static Specification<Employee> getByUUID(String uuid) {
        return (root, query, cb) ->
            cb.equal(root.get(Employee_.uuid), UuidUtils.convertUUIDToBytes(uuid));
    }

    public static Specification<Employee> getByCpf(String cpf) {
        return (root, query, cb) ->
            cb.like(root.get(Employee_.cpf), "%" + cpf.trim() + "%");
    }

    public static Specification<Employee> getByName(String name) {
        return (root, query, cb) ->
            cb.like(cb.upper(root.get(Employee_.name)), "%" + name.trim().toUpperCase() + "%");
    }

    public static Specification<Employee> getByEmail(String email) {
        return (root, query, cb) ->
            cb.like(
                cb.upper(root.join(Employee_.user).get(User_.email)),
                "%" + email.trim().toUpperCase() + "%"
            );
    }
}