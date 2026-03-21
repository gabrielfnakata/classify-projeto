package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.ClassroomCreateDTO;
import br.com.ifsp.classify.dtos.get.ClassroomGetDTO;
import br.com.ifsp.classify.dtos.update.ClassroomUpdateDTO;
import br.com.ifsp.classify.models.Classroom;
import br.com.ifsp.classify.repositories.ClassroomRepository;
import org.springframework.stereotype.Service;

@Service
public class ClassroomService extends AbstractService<Classroom, ClassroomCreateDTO, ClassroomGetDTO, ClassroomUpdateDTO, Integer> {

    public ClassroomService(ClassroomRepository repository) {
        super(repository);
    }

    @Override
    ClassroomGetDTO returnDTO(Classroom entity) {
        return null;
    }

    @Override
    public ClassroomGetDTO create(ClassroomCreateDTO entity) {
        return null;
    }

    @Override
    public ClassroomGetDTO update(String uuid, ClassroomUpdateDTO entity) {
        return null;
    }
}