package br.com.ifsp.classify.specifications;

import br.com.ifsp.classify.models.Student;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.data.jpa.domain.Specification;

public class StudentSpecification {

    private static final String UUID = "uuid";

    public static Specification<Student> getByUUID(String uuid) {
        return (root, query, cb) ->
                cb.equal(root.get(UUID), UuidUtils.convertUUIDToBytes(uuid));
    }
}