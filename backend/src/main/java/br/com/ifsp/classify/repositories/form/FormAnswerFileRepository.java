package br.com.ifsp.classify.repositories.form;

import br.com.ifsp.classify.models.form.AnswerFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FormAnswerFileRepository extends JpaRepository<AnswerFile, Long> {
    Optional<AnswerFile> findByUuid(UUID uuid);
}
