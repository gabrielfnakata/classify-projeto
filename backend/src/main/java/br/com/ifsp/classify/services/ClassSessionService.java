package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.ClassSessionCreateDTO;
import br.com.ifsp.classify.models.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class AulaService extends AbstractService<ClassSession, ClassSessionCreateDTO, Long> {

    public AulaService(JpaRepository<ClassSession, Long> repository) {
        super(repository);
    }

    @Override
    ClassSessionCreateDTO returnDTO(ClassSession entity) {
        return null;
    }

    @Override
    public ClassSessionCreateDTO create(ClassSessionCreateDTO entity) {
        return null;
    }

    @Override
    public ClassSessionCreateDTO update(Long aLong, ClassSessionCreateDTO entity) {
        return null;
    }
}