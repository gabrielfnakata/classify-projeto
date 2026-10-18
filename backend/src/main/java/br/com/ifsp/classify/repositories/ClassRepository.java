package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Class;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassRepository extends AbstractRepository<Class, Long> {
    Optional<Class> findByUuid(byte[] uuid);
}
