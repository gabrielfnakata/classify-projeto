package br.com.ifsp.classify.specifications;

import br.com.ifsp.classify.models.ClassSession;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ClassSessionSpecification {

    private static final String UUID = "uuid";
    private static final String START_TIME = "startTime";

    public static Specification<ClassSession> getBySubjectTeacherId(Long subjectTeacherId) {
        return (root, query, cb) ->
                cb.equal(root.get("subjectTeacher").get("id"), subjectTeacherId);
    }

    public static Specification<ClassSession> filter(String studentUuid, String employeeUuid,
            String classroomUuid, String subjectUuid, String classUuid) {
        return filter(studentUuid, employeeUuid, classroomUuid, subjectUuid, classUuid, null, null);
    }

    /**
     * Filtro combinável usado pelas telas de detalhe. Parâmetros nulos/vazios são ignorados,
     * então o mesmo endpoint atende aluno, professor, sala, disciplina e turma. `from` e `to`
     * recortam a janela pelo início da aula, para a tela não puxar a base inteira.
     */
    public static Specification<ClassSession> filter(String studentUuid, String employeeUuid,
            String classroomUuid, String subjectUuid, String classUuid, LocalDateTime from, LocalDateTime to) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (!Utils.isNullOrEmpty(employeeUuid))
                predicates.add(cb.equal(
                        root.get("subjectTeacher").get("employee").get(UUID),
                        UuidUtils.convertUUIDToBytes(employeeUuid)));

            if (!Utils.isNullOrEmpty(subjectUuid))
                predicates.add(cb.equal(
                        root.get("subjectTeacher").get("subject").get(UUID),
                        UuidUtils.convertUUIDToBytes(subjectUuid)));

            if (!Utils.isNullOrEmpty(classroomUuid))
                predicates.add(cb.equal(
                        root.get("classroom").get(UUID),
                        UuidUtils.convertUUIDToBytes(classroomUuid)));

            if (!Utils.isNullOrEmpty(classUuid))
                predicates.add(cb.equal(
                        root.join("classSessionClass", JoinType.LEFT).get(UUID),
                        UuidUtils.convertUUIDToBytes(classUuid)));

            if (from != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get(START_TIME), from));

            if (to != null)
                predicates.add(cb.lessThanOrEqualTo(root.get(START_TIME), to));

            if (!Utils.isNullOrEmpty(studentUuid)) {
                byte[] uuid = UuidUtils.convertUUIDToBytes(studentUuid);

                // Aula individual do aluno OU aula de uma turma em que ele está matriculado.
                // LEFT JOIN explícito: um join implícito viraria INNER e derrubaria o outro lado do OR.
                Predicate individual = cb.equal(root.join("student", JoinType.LEFT).get(UUID), uuid);
                Predicate viaClass = cb.equal(
                        root.join("classSessionClass", JoinType.LEFT)
                                .join("students", JoinType.LEFT)
                                .get(UUID),
                        uuid);

                predicates.add(cb.or(individual, viaClass));
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
