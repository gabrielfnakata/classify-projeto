package br.com.ifsp.classify.repositories.form;

import br.com.ifsp.classify.models.form.FormSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FormSubmissionRepository extends JpaRepository<FormSubmission, Long> {
    Optional<FormSubmission> getByUuid(UUID uuid);
}
