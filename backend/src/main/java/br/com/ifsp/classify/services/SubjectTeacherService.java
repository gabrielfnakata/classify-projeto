package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.SubjectTeacherCreateDTO;
import br.com.ifsp.classify.dtos.get.SubjectTeacherGetDTO;
import br.com.ifsp.classify.dtos.update.SubjectTeacherUpdateDTO;
import br.com.ifsp.classify.models.SubjectTeacher;
import br.com.ifsp.classify.repositories.AbstractRepository;
import org.springframework.stereotype.Service;

@Service
public class SubjectTeacherService extends AbstractService<SubjectTeacher, SubjectTeacherCreateDTO, SubjectTeacherGetDTO, SubjectTeacherUpdateDTO, Long> {

    public SubjectTeacherService(AbstractRepository<SubjectTeacher, Long> repository) {
        super(repository);
    }

    @Override
    SubjectTeacherGetDTO returnDTO(SubjectTeacher entity) {
        return null;
    }

    @Override
    public SubjectTeacherGetDTO create(SubjectTeacherCreateDTO entity) {
        return null;
    }

    @Override
    public SubjectTeacherGetDTO update(String uuid, SubjectTeacherUpdateDTO entity) {
        return null;
    }
}