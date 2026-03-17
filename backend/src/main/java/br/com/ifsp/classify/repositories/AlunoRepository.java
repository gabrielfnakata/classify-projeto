package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlunoRepository extends JpaRepository<Student, Long> {}