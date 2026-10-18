package br.com.ifsp.classify.repositories.form;

import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.models.form.Form;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FormRepository extends JpaRepository<Form, Long> {
    @Query("FROM Form f WHERE f.teacher = :employee")
    public List<Form> getAllFromEmployee(Employee employee);

    Optional<Form> findByUuid(UUID uuid);
}
