package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.ClassroomCreateDTO;
import br.com.ifsp.classify.dtos.get.ClassroomGetDTO;
import br.com.ifsp.classify.dtos.update.ClassroomUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Classroom;
import br.com.ifsp.classify.repositories.ClassroomRepository;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class ClassroomService extends AbstractService<Classroom, ClassroomCreateDTO, ClassroomGetDTO, ClassroomUpdateDTO, Integer> {

    private final String CAPACITY_ZERO_OR_LESS_MESSAGE = "A capacidade da sala deve ser maior do que 0";
    private final AuditService auditService;

    public ClassroomService(ClassroomRepository repository, AuditService auditService) {
        super(repository);
        this.auditService = auditService;
    }

    @Override
    ClassroomGetDTO returnDTO(Classroom classroom) {
        if (classroom == null)
            return null;

        return new ClassroomGetDTO(
                UuidUtils.convertBytesToString(classroom.getUuid()),
                classroom.getName(),
                classroom.getCapacity(),
                classroom.getDisabled()
        );
    }

    @Override
    public ClassroomGetDTO create(ClassroomCreateDTO classroomDTO) {
        if (classroomDTO == null)
            return null;

        if (classroomDTO.capacity() == null)
            throw new DtoException("A capacidade da sala não pode ser nula");
        else if (classroomDTO.capacity() <= 0)
            throw new DtoException(CAPACITY_ZERO_OR_LESS_MESSAGE);

        Classroom newClassroom = new Classroom();
        newClassroom.setUuid(UuidUtils.generateUUID());

        if (!Utils.isNullOrEmpty(classroomDTO.name()))
            newClassroom.setName(classroomDTO.name().trim().toUpperCase());

        newClassroom.setCapacity(classroomDTO.capacity());
        newClassroom.setDisabled(classroomDTO.isDisabled() != null && classroomDTO.isDisabled());

        repository.save(newClassroom);
        ClassroomGetDTO createdClassroom = returnDTO(newClassroom);
        auditService.logInsert("CLASSROOM", Long.valueOf(newClassroom.getId()), createdClassroom);

        return createdClassroom;
    }

    @Override
    public ClassroomGetDTO update(String uuid, ClassroomUpdateDTO classroomDTO) {
        Classroom classroom = getEntityById(uuid);
        if (classroom == null || classroomDTO == null)
            return null;

        ClassroomGetDTO oldClassroom = returnDTO(classroom);

        if (!Utils.isNullOrEmpty(classroomDTO.name()))
            classroom.setName(classroomDTO.name().trim().toUpperCase());

        if (classroomDTO.capacity() != null) {
            if (classroomDTO.capacity() <= 0)
                throw new DtoException(CAPACITY_ZERO_OR_LESS_MESSAGE);

            classroom.setCapacity(classroomDTO.capacity());
        }

        if (classroomDTO.isDisabled() != null)
            classroom.setDisabled(classroomDTO.isDisabled());

        repository.save(classroom);
        ClassroomGetDTO updatedClassroom = returnDTO(classroom);
        auditService.logUpdate("CLASSROOM", Long.valueOf(classroom.getId()), oldClassroom, updatedClassroom);

        return updatedClassroom;
    }

    @Override
    public ResponseEntity<Void> delete(String uuid) {
        Classroom classroom = getEntityById(uuid);
        if (classroom == null)
            return ResponseEntity.badRequest().build();

        ClassroomGetDTO oldClassroom = returnDTO(classroom);
        Long id = Long.valueOf(classroom.getId());
        repository.delete(classroom);
        auditService.logDelete("CLASSROOM", id, oldClassroom);

        return ResponseEntity.noContent().build();
    }
}