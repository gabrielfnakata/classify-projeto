package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FuncionarioRepository extends JpaRepository<Employee, Long> {}