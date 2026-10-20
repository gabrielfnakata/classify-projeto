package br.com.ifsp.classify.repositories.form;

import br.com.ifsp.classify.models.Student;
import br.com.ifsp.classify.models.form.FormSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FormSubmissionRepository extends JpaRepository<FormSubmission, Long> {
    Optional<FormSubmission> getByUuid(UUID uuid);
    Page<FormSubmission> findAllByStudent(Student student, Pageable pageable);

    @Query("SELECT s.student.id FROM FormSubmission s WHERE s.form.id = :formId AND s.student.id IN :studentIds")
    List<Long> findExistingStudentIdsByFormAndStudents(Long formId, List<Long> studentIds);
}
