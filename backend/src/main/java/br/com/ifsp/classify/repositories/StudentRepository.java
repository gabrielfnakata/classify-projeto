package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Student;

import java.util.List;

import java.util.Optional;

public interface StudentRepository extends AbstractRepository<Student, Long> {
    Optional<Student> findByUserEmail(String email);

    List<Student> findByUuidIsIn(List<byte[]> studentsUuids);
}
