package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.ClassCreateDTO;
import br.com.ifsp.classify.dtos.get.ClassGetDTO;
import br.com.ifsp.classify.dtos.get.ClassStudentSummaryDTO;
import br.com.ifsp.classify.dtos.update.ClassUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.exceptions.ExceptionCode;
import br.com.ifsp.classify.models.Class;
import br.com.ifsp.classify.models.Student;
import br.com.ifsp.classify.repositories.ClassRepository;
import br.com.ifsp.classify.repositories.ClassSessionRepository;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClassService extends AbstractService<Class, ClassCreateDTO, ClassGetDTO, ClassUpdateDTO, Long> {

    private final StudentService studentService;
    private final ClassSessionRepository classSessionRepository;
    private final AuditService auditService;

    public ClassService(ClassRepository repository, StudentService studentService, ClassSessionRepository classSessionRepository, AuditService auditService) {
        super(repository);
        this.studentService = studentService;
        this.classSessionRepository = classSessionRepository;
        this.auditService = auditService;
    }

    @Override
    public ResponseEntity<Void> delete(String uuid) {
        Class classModel = getEntityById(uuid);
        if (classModel == null)
            return ResponseEntity.badRequest().build();

        long scheduledSessions = classSessionRepository.findAll()
                .stream()
                .filter(session -> session.getClassSessionClass() != null
                        && session.getClassSessionClass().getId().equals(classModel.getId()))
                .count();

        if (scheduledSessions > 0)
            throw new DtoException("Essa turma possui " + scheduledSessions
                    + " aula(s) agendada(s). Exclua os agendamentos dela antes de excluir a turma.");

        classModel.getStudents().clear();
        repository.save(classModel);
        auditService.logDelete("CLASS", classModel.getId(), classModel);

        return super.delete(uuid);
    }

    @Override
    ClassGetDTO returnDTO(Class classModel) {
        if (classModel == null)
            return null;

        return new ClassGetDTO(
            UuidUtils.convertBytesToString(classModel.getUuid()),
            classModel.getName(),
            classModel.getDescription(),
            classModel.getStudents()
                .stream()
                .map(student -> new ClassStudentSummaryDTO(
                        UuidUtils.convertBytesToString(student.getUuid()),
                        student.getName()
                ))
                .toList()
        );
    }

    @Override
    public ClassGetDTO create(ClassCreateDTO classDTO) {
        if (classDTO == null)
            return null;

        if (Utils.isNullOrEmpty(classDTO.name()))
            throw new DtoException(ExceptionCode.MISSING_FIELD, "O nome da turma não pode ser nulo ou vazio");

        Class newClass = new Class();
        newClass.setUuid(UuidUtils.generateUUID());
        newClass.setName(Utils.trimAndUpper(classDTO.name()));
        newClass.setDescription(Utils.isNullOrEmpty(classDTO.description()) ? null : classDTO.description().trim());

        repository.save(newClass);
        auditService.logInsert("CLASS", newClass.getId(), newClass);

        return returnDTO(newClass);
    }

    @Override
    public ClassGetDTO update(String uuid, ClassUpdateDTO classDTO) {
        Class classModel = getEntityById(uuid);
        if (classModel == null || classDTO == null)
            return null;

        if (!Utils.isNullOrEmpty(classDTO.name()))
            classModel.setName(Utils.trimAndUpper(classDTO.name()));

        if (classDTO.description() != null)
            classModel.setDescription(classDTO.description().isBlank() ? null : classDTO.description().trim());

        ClassGetDTO oldClass = returnDTO(classModel);
        repository.save(classModel);
        ClassGetDTO updatedClass = returnDTO(classModel);

        auditService.logUpdate("CLASS", classModel.getId(), oldClass, updatedClass);
        return updatedClass;
    }

    public List<ClassStudentSummaryDTO> addStudents(String classUuid, List<String> studentUuids) {
        if (!Utils.hasElements(studentUuids))
            return null;

        Class classModel = getEntityById(classUuid);
        if (classModel == null)
            throw new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "A turma informada não foi encontrada");

        ClassGetDTO oldClass = returnDTO(classModel);
        for (String studentUuid : studentUuids) {
            Student student = studentService.getEntityById(studentUuid);
            if (student == null)
                throw new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "O aluno informado não foi encontrado ou não foi registrado");

            if (!classModel.getStudents().contains(student))
                classModel.getStudents().add(student);
        }

        repository.save(classModel);
        ClassGetDTO updatedClass = returnDTO(classModel);

        auditService.logUpdate("CLASS", classModel.getId(), oldClass, updatedClass);
        return updatedClass.students();
    }

    public List<ClassStudentSummaryDTO> removeStudent(String classUuid, String studentUuid) {
        Class classModel = getEntityById(classUuid);
        if (classModel == null)
            throw new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "A turma informada não foi encontrada");

        Student student = studentService.getEntityById(studentUuid);
        if (student == null)
            throw new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "O aluno informado não foi encontrado ou não foi registrado");

        ClassGetDTO oldClass = returnDTO(classModel);
        classModel.getStudents().remove(student);
        repository.save(classModel);

        ClassGetDTO updatedClass = returnDTO(classModel);

        auditService.logUpdate("CLASS", classModel.getId(), oldClass, updatedClass);
        return updatedClass.students();
    }
}
