package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Guardian;
import org.springframework.stereotype.Repository;

@Repository
public interface GuardianRepository extends AbstractRepository<Guardian, Long> {}