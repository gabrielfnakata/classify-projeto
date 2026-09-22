package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Audit;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditRepository extends AbstractRepository<Audit, Long> {

    List<Audit> findByTableNameAndRegisterIdOrderByDateDesc(String tableName, Long registerId);

    List<Audit> findByTableNameOrderByDateDesc(String tableName);

    List<Audit> findAllByOrderByDateDesc();
}
