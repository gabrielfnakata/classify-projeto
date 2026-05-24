package br.com.ifsp.classify.specifications;

import br.com.ifsp.classify.models.ClassSession;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ClassSessionSpecification {

    private static final String START_TIME = "startTime";
    private static final String SUBJECT_TEACHER = "subjectTeacher";
    private static final String EMPLOYEE = "employee";
    private static final String CPF = "cpf";

    public static Specification<ClassSession> getByDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime startOfNextDay = date.plusDays(1).atStartOfDay();

        return (root, query, cb) ->
                cb.and(
                        cb.greaterThanOrEqualTo(root.get(START_TIME), startOfDay),
                        cb.lessThan(root.get(START_TIME), startOfNextDay)
                );
    }

    public static Specification<ClassSession> getByProfessorCpf(String cpf) {
        return (root, query, cb) ->
                cb.equal(
                        root.get(SUBJECT_TEACHER).get(EMPLOYEE).get(CPF),
                        cpf.trim()
                );
    }
}
