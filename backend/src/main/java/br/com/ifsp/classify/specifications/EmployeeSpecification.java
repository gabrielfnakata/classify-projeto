package br.com.ifsp.classify.specifications;

import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.data.jpa.domain.Specification;

public class EmployeeSpecification {

    private static final String UUID = "uuid";
    private static final String CPF = "cpf";
    private static final String NAME = "name";
    private static final String EMAIL = "email";

    public static Specification<Employee> getByUUID(String uuid) {
        return (root, query, cb) ->
            cb.equal(root.get(UUID), UuidUtils.convertUUIDToBytes(uuid));
    }

    public static Specification<Employee> getByCpf(String cpf) {
        return (root, query, cb) ->
            cb.like(root.get(CPF), "%" + cpf.trim() + "%");
    }

    public static Specification<Employee> getByName(String name) {
        return (root, query, cb) ->
            cb.like(cb.upper(root.get(NAME)), "%" + name.trim().toUpperCase() + "%");
    }

    public static Specification<Employee> getByEmail(String email) {
        return (root, query, cb) ->
            cb.like(cb.upper(root.get(EMAIL)), "%" + email.trim().toUpperCase() + "%");
    }
}