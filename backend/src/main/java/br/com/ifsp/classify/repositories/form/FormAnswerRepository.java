package br.com.ifsp.classify.repositories.form;

import br.com.ifsp.classify.models.form.FormAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.lang.ScopedValue;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FormAnswerRepository extends JpaRepository<FormAnswer, Long> {
    Optional<FormAnswer> findByUuid(UUID uuid);
}
