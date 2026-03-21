package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.SubjectTeacherCreateDTO;
import br.com.ifsp.classify.models.SubjectTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class ProfessorDisciplinaService extends AbstractService<SubjectTeacher, SubjectTeacherCreateDTO, Long> {

    public ProfessorDisciplinaService(JpaRepository<SubjectTeacher, Long> repository) {
        super(repository);
    }

    @Override
    SubjectTeacherCreateDTO returnDTO(SubjectTeacher entity) {
        return null;
    }

    @Override
    public SubjectTeacherCreateDTO create(SubjectTeacherCreateDTO entity) {
        return null;
    }

    @Override
    public SubjectTeacherCreateDTO update(Long aLong, SubjectTeacherCreateDTO entity) {
        return null;
    }
}