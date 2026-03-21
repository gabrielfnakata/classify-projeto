package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.ClassSession;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassSessionRepository extends AbstractRepository<ClassSession, Long> {}