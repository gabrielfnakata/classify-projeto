package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Class;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassRepository extends AbstractRepository<Class, Integer> {}