package br.com.ifsp.classify.repositories.form;

import br.com.ifsp.classify.models.form.FormQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FormQuestionRepository extends JpaRepository<FormQuestion, Long> {
    Optional<FormQuestion> findByUuid(UUID uuid);

    List<FormQuestion> findAllByUuidIn(Collection<UUID> uuids);
}
