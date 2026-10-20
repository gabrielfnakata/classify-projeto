package br.com.ifsp.classify.specifications;

import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.models.Employee_;
import br.com.ifsp.classify.models.SubjectTeacher;
import br.com.ifsp.classify.models.SubjectTeacher_;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.data.jpa.domain.Specification;

public class SubjectTeacherSpecification {

    public static Specification<SubjectTeacher> getByUUID(String uuid) {
        return (root, query, cb) ->
                cb.equal(root.get(SubjectTeacher_.uuid), UuidUtils.convertUUIDToBytes(uuid));
    }

    public static Specification<SubjectTeacher> getByDeleted(Boolean deleted) {
        return (root, query, cb) ->
                cb.equal(root.join(SubjectTeacher_.EMPLOYEE).get(Employee_.IS_DELETED), deleted);
    }
}
