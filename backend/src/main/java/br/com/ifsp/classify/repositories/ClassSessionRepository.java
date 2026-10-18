package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.ClassSession;
import br.com.ifsp.classify.repositories.projections.SessionCountProjection;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClassSessionRepository extends AbstractRepository<ClassSession, Long> {

    /*
     * As contagens saem agregadas no banco. Carregar as aulas em memória só para contá-las
     * custava quase um segundo por listagem, com todos os relacionamentos vindo junto.
     * Aula cancelada não entra em nenhuma das duas contas.
     */

    @Query("""
        SELECT st.subject.uuid AS key,
               SUM(CASE WHEN cs.startTime >= :now THEN 1 ELSE 0 END) AS upcoming,
               SUM(CASE WHEN cs.startTime >= :dayStart AND cs.startTime < :dayEnd THEN 1 ELSE 0 END) AS today
        FROM ClassSession cs JOIN cs.subjectTeacher st
        WHERE cs.status <> br.com.ifsp.classify.models.enums.ClassSessionStatus.CANCELED
        GROUP BY st.subject.uuid
        """)
    List<SessionCountProjection> countBySubject(@Param("now") LocalDateTime now,
            @Param("dayStart") LocalDateTime dayStart, @Param("dayEnd") LocalDateTime dayEnd);

    @Query("""
        SELECT st.employee.uuid AS key,
               SUM(CASE WHEN cs.startTime >= :now THEN 1 ELSE 0 END) AS upcoming,
               SUM(CASE WHEN cs.startTime >= :dayStart AND cs.startTime < :dayEnd THEN 1 ELSE 0 END) AS today
        FROM ClassSession cs JOIN cs.subjectTeacher st
        WHERE cs.status <> br.com.ifsp.classify.models.enums.ClassSessionStatus.CANCELED
        GROUP BY st.employee.uuid
        """)
    List<SessionCountProjection> countByEmployee(@Param("now") LocalDateTime now,
            @Param("dayStart") LocalDateTime dayStart, @Param("dayEnd") LocalDateTime dayEnd);

    @Query("""
        SELECT cs.classroom.uuid AS key,
               SUM(CASE WHEN cs.startTime >= :now THEN 1 ELSE 0 END) AS upcoming,
               SUM(CASE WHEN cs.startTime >= :dayStart AND cs.startTime < :dayEnd THEN 1 ELSE 0 END) AS today
        FROM ClassSession cs
        WHERE cs.status <> br.com.ifsp.classify.models.enums.ClassSessionStatus.CANCELED
        GROUP BY cs.classroom.uuid
        """)
    List<SessionCountProjection> countByClassroom(@Param("now") LocalDateTime now,
            @Param("dayStart") LocalDateTime dayStart, @Param("dayEnd") LocalDateTime dayEnd);

    @Query("""
        SELECT cs.classSessionClass.uuid AS key,
               SUM(CASE WHEN cs.startTime >= :now THEN 1 ELSE 0 END) AS upcoming,
               SUM(CASE WHEN cs.startTime >= :dayStart AND cs.startTime < :dayEnd THEN 1 ELSE 0 END) AS today
        FROM ClassSession cs
        WHERE cs.status <> br.com.ifsp.classify.models.enums.ClassSessionStatus.CANCELED
          AND cs.classSessionClass IS NOT NULL
        GROUP BY cs.classSessionClass.uuid
        """)
    List<SessionCountProjection> countByClass(@Param("now") LocalDateTime now,
            @Param("dayStart") LocalDateTime dayStart, @Param("dayEnd") LocalDateTime dayEnd);
}
