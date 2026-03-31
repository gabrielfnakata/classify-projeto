package br.com.ifsp.classify.specifications;

import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.data.jpa.domain.Specification;

public class EmployeeSpecification {

    private static final String UUID = "uuid";

    public static Specification<Employee> getByUUID(String uuid) {
        return (root, query, cb) ->
                cb.equal(root.get(UUID), UuidUtils.convertUUIDToBytes(uuid));
    }
}