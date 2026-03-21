package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.ClassroomCreateDTO;
import br.com.ifsp.classify.models.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class SalaService extends AbstractService<Classroom, ClassroomCreateDTO, Integer> {

    public SalaService(JpaRepository<Classroom, Integer> repository) {
        super(repository);
    }

    @Override
    ClassroomCreateDTO returnDTO(Classroom entity) {
        return null;
    }

    @Override
    public ClassroomCreateDTO create(ClassroomCreateDTO entity) {
        return null;
    }

    @Override
    public ClassroomCreateDTO update(Integer integer, ClassroomCreateDTO entity) {
        return null;
    }
}