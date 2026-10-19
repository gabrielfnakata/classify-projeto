package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Student;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface StudentRepository extends AbstractRepository<Student, Long> {
    Optional<Student> 
    findByUserEmail(String email);
    boolean existsByUserEmailAndIsDeletedTrue(String email);

    List<Student> findByUuidIsIn(List<byte[]> studentsUuids);
}
