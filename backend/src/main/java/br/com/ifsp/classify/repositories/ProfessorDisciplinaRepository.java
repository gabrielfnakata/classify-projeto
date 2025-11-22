package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.ProfessorDisciplina;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfessorDisciplinaRepository extends JpaRepository<ProfessorDisciplina, Long> {}