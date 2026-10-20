package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.ClassCreateDTO;
import br.com.ifsp.classify.dtos.filter.ClassFilterDTO;
import br.com.ifsp.classify.dtos.get.ClassGetDTO;
import br.com.ifsp.classify.dtos.get.AuditGetDTO;
import br.com.ifsp.classify.dtos.get.ClassStudentCountDTO;
import br.com.ifsp.classify.dtos.get.ClassStudentSummaryDTO;
import br.com.ifsp.classify.dtos.get.OptionGetDTO;
import br.com.ifsp.classify.dtos.get.ClassSummaryDTO;
import br.com.ifsp.classify.dtos.update.ClassUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.exceptions.ExceptionCode;
import br.com.ifsp.classify.models.Class;
import br.com.ifsp.classify.models.Student;
import br.com.ifsp.classify.specifications.ClassSpecification;
import br.com.ifsp.classify.repositories.ClassRepository;
import br.com.ifsp.classify.repositories.ClassSessionRepository;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class ClassService extends AbstractService<Class, ClassCreateDTO, ClassGetDTO, ClassUpdateDTO, ClassFilterDTO, Long> {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final StudentService studentService;
    private final ClassSessionRepository classSessionRepository;
    private final AuditService auditService;
    private final AccessScopeService accessScope;

    public ClassService(ClassRepository repository, StudentService studentService, ClassSessionRepository classSessionRepository, AuditService auditService, AccessScopeService accessScope) {
        super(repository);
        this.accessScope = accessScope;
        this.studentService = studentService;
        this.classSessionRepository = classSessionRepository;
        this.auditService = auditService;
    }

    @Override
    public ResponseEntity<Void> delete(String uuid) {
        Class classModel = getEntityById(uuid);
        if (classModel == null)
            return ResponseEntity.badRequest().build();

        accessScope.requireCanViewClass(classModel);

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

    /**
     * Versão enxuta para quando a turma aparece dentro de outro recurso (uma aula, por exemplo):
     * manda a contagem de alunos em vez da lista inteira, que se repetiria a cada aula.
     */
    ClassSummaryDTO returnSummaryDTO(Class classModel) {
        if (classModel == null)
            return null;

        return new ClassSummaryDTO(
            UuidUtils.convertBytesToString(classModel.getUuid()),
            classModel.getName(),
            classModel.getDescription(),
            classModel.getStudents().size()
        );
    }

    /** Professor só lista as turmas que têm aula com ele. */
    @Override
    protected Specification<Class> accessSpecification() {
        if (!accessScope.isProfessor())
            return Specification.unrestricted();

        return AccessScopeService.idIn(accessScope.linkedClassIds(accessScope.currentEmployee()));
    }

    @Override
    public ClassGetDTO getById(String uuid) {
        Class classModel = Utils.isNullOrEmpty(uuid) ? null : getEntityById(uuid);
        if (classModel == null)
            return null;

        accessScope.requireCanViewClass(classModel);
        return returnDTO(classModel);
    }

    /** Todas as turmas, só com nome: é o que o agendamento precisa para criar um vínculo novo. */
    public List<OptionGetDTO> findOptions() {
        return repository.findAll().stream()
            .map(classModel -> new OptionGetDTO(UuidUtils.convertBytesToString(classModel.getUuid()), classModel.getName()))
            .sorted(java.util.Comparator.comparing(OptionGetDTO::name))
            .toList();
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

        accessScope.requireCanViewClass(classModel);

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

        accessScope.requireCanViewClass(classModel);

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

    // A turma não guarda data de entrada/saída dos alunos; cada alteração dela fica na auditoria
    // com a lista completa de alunos, então a evolução sai de lá.
    public List<ClassStudentCountDTO> getStudentCountHistory(String classUuid) {
        Class classModel = getEntityById(classUuid);
        if (classModel == null)
            return null;

        accessScope.requireCanViewClass(classModel);

        List<AuditGetDTO> entries = new ArrayList<>(auditService.findByTableNameAndRegisterId("CLASS", classModel.getId()));
        Collections.reverse(entries);

        List<ClassStudentCountDTO> history = new ArrayList<>();
        for (AuditGetDTO entry : entries) {
            if (entry.newData() == null)
                continue;

            try {
                JsonNode students = OBJECT_MAPPER.readTree(entry.newData()).path("students");
                history.add(new ClassStudentCountDTO(entry.date(), students.isArray() ? students.size() : 0));
            } catch (JsonProcessingException e) {
                // Registro de auditoria ilegível não impede o restante do histórico.
            }
        }

        return history;
    }

    public List<ClassStudentSummaryDTO> removeStudent(String classUuid, String studentUuid) {
        Class classModel = getEntityById(classUuid);
        if (classModel == null)
            throw new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "A turma informada não foi encontrada");

        accessScope.requireCanViewClass(classModel);

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

    @Override
    public Specification<Class> createSpecificationFromFilter(ClassFilterDTO filterDTO) {
        Specification<Class> conditions = Specification.unrestricted();

        if (filterDTO == null)
            return conditions;

        if (!Utils.isNullOrEmpty(filterDTO.name())) {
            conditions = conditions.and(ClassSpecification.getByName(filterDTO.name()));
        }

        if (!Utils.isNullOrEmpty(filterDTO.description())) {
            conditions = conditions.and(ClassSpecification.getByDescription(filterDTO.name()));
        }

        return conditions;
    }
}
