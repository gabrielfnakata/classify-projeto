package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Subject;
import org.springframework.stereotype.Repository;

@Repository
public interface SubjectRepository extends AbstractRepository<Subject, Integer> {}