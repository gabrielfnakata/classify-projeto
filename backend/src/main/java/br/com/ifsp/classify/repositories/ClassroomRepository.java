package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Classroom;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassroomRepository extends AbstractRepository<Classroom, Integer> {}