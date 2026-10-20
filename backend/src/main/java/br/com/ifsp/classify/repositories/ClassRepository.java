package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Class;

import java.util.Optional;
import java.util.List;

public interface ClassRepository extends AbstractRepository<Class, Long> {
    Optional<Class> findByUuid(byte[] uuid);
    List<Class> findByStudentsId(Long studentId);
}
