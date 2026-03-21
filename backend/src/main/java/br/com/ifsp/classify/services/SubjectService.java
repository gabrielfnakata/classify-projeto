package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.SubjectCreateDTO;
import br.com.ifsp.classify.models.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class DisciplinaService extends AbstractService<Subject, SubjectCreateDTO, Integer> {

    public DisciplinaService(JpaRepository<Subject, Integer> repository) {
        super(repository);
    }

    @Override
    SubjectCreateDTO returnDTO(Subject entity) {
        return null;
    }

    @Override
    public SubjectCreateDTO create(SubjectCreateDTO entity) {
        return null;
    }

    @Override
    public SubjectCreateDTO update(Integer integer, SubjectCreateDTO entity) {
        return null;
    }
}