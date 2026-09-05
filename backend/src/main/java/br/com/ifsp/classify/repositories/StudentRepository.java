package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Student;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends AbstractRepository<Student, Long> {
    List<Student> findByUuidIsIn(List<byte[]> studentsUuids);
}
