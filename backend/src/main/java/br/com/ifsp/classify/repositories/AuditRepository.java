package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Audit;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditRepository extends AbstractRepository<Audit, Long> {

    List<Audit> findByTableNameAndRegisterIdOrderByDateDesc(String tableName, Long registerId);

    List<Audit> findByTableNameOrderByDateDesc(String tableName);

    List<Audit> findAllByOrderByDateDesc();

    @Query("select max(a.id) from Audit a where a.tableName = :tableName and a.operation = 'DELETE' group by a.registerId")
    List<Long> findLatestDeleteIds(@Param("tableName") String tableName);
}
