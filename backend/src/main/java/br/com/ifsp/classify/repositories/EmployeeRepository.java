package br.com.ifsp.classify.repositories;

import java.util.Optional;

import br.com.ifsp.classify.models.Employee;

public interface EmployeeRepository extends AbstractRepository<Employee, Long> {

    Optional<Employee> findByUserEmailAndIsDeletedFalse(String email);
}
