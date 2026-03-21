package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Student;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends AbstractRepository<Student, Long> {}