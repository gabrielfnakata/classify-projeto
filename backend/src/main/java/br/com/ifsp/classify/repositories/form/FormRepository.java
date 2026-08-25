package br.com.ifsp.classify.repositories.form;

import br.com.ifsp.classify.models.form.Form;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FormRepository extends JpaRepository<Form, Long> {
}
