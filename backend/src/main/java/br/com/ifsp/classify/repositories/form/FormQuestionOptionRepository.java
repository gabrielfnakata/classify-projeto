package br.com.ifsp.classify.repositories.form;

import br.com.ifsp.classify.models.form.FormQuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FormQuestionOptionRepository extends JpaRepository<FormQuestionOption, Long> {
    Optional<FormQuestionOption> findByUuid(String s);

    List<FormQuestionOption> findAllByUuidIn(Collection<UUID> uuids);
}
