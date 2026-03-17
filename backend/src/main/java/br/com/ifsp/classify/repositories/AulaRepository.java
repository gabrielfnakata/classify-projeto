package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AulaRepository extends JpaRepository<ClassSession, Long> {}