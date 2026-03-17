package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DisciplinaRepository extends JpaRepository<Subject, Integer> {}