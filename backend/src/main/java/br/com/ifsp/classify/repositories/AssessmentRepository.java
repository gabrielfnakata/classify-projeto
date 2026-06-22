package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Assessment;
import org.springframework.stereotype.Repository;

@Repository
public interface AssessmentRepository extends AbstractRepository<Assessment, Long> {}