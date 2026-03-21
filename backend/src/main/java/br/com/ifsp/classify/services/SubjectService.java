package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.SubjectCreateDTO;
import br.com.ifsp.classify.dtos.get.SubjectGetDTO;
import br.com.ifsp.classify.dtos.update.SubjectUpdateDTO;
import br.com.ifsp.classify.models.Subject;
import br.com.ifsp.classify.repositories.SubjectRepository;
import org.springframework.stereotype.Service;

@Service
public class SubjectService extends AbstractService<Subject, SubjectCreateDTO, SubjectGetDTO, SubjectUpdateDTO, Integer> {

    public SubjectService(SubjectRepository repository) {
        super(repository);
    }

    @Override
    SubjectGetDTO returnDTO(Subject entity) {
        return null;
    }

    @Override
    public SubjectGetDTO create(SubjectCreateDTO entity) {
        return null;
    }

    @Override
    public SubjectGetDTO update(String uuid, SubjectUpdateDTO entity) {
        return null;
    }
}