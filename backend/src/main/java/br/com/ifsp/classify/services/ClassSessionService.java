package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.ClassSessionCreateDTO;
import br.com.ifsp.classify.dtos.get.ClassSessionGetDTO;
import br.com.ifsp.classify.dtos.update.ClassSessionUpdateDTO;
import br.com.ifsp.classify.models.ClassSession;
import br.com.ifsp.classify.repositories.ClassSessionRepository;
import org.springframework.stereotype.Service;

@Service
public class ClassSessionService extends AbstractService<ClassSession, ClassSessionCreateDTO, ClassSessionGetDTO, ClassSessionUpdateDTO, Long> {

    public ClassSessionService(ClassSessionRepository repository) {
        super(repository);
    }

    @Override
    ClassSessionGetDTO returnDTO(ClassSession entity) {
        return null;
    }

    @Override
    public ClassSessionGetDTO create(ClassSessionCreateDTO entity) {
        return null;
    }

    @Override
    public ClassSessionGetDTO update(String uuid, ClassSessionUpdateDTO entity) {
        return null;
    }
}