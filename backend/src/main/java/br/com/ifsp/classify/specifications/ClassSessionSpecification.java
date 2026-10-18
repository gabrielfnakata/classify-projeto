package br.com.ifsp.classify.specifications;

import br.com.ifsp.classify.models.ClassSession;

import java.util.List;

import org.springframework.data.jpa.domain.Specification;

public class ClassSessionSpecification {

    private static final String ID = "id";
    private static final String CLASS = "class";
    private static final String STUDENT = "student";

    public static Specification<ClassSession> getByStudentId(Long studentId) {
        return (root, query, cb) -> cb.equal(root.get(STUDENT).get(ID), studentId);
    }

    public static Specification<ClassSession> getByClassId(List<Long> classId) {
        return (root, query, cb) -> cb.equal(root.get(CLASS).in(ID), classId);
    }
    
}
