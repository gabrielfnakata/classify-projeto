package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.ClassSessionCreateDTO;
import br.com.ifsp.classify.dtos.get.ClassSessionClassroomGetDTO;
import br.com.ifsp.classify.dtos.get.ClassSessionGetDTO;
import br.com.ifsp.classify.dtos.get.ClassSessionStudentGetDTO;
import br.com.ifsp.classify.dtos.get.ClassSessionSubjectTeacherGetDTO;
import br.com.ifsp.classify.dtos.update.ClassSessionUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.ClassSession;
import br.com.ifsp.classify.models.Classroom;
import br.com.ifsp.classify.models.Student;
import br.com.ifsp.classify.models.SubjectTeacher;
import br.com.ifsp.classify.repositories.ClassSessionRepository;
import br.com.ifsp.classify.repositories.ClassroomRepository;
import br.com.ifsp.classify.repositories.StudentRepository;
import br.com.ifsp.classify.repositories.SubjectTeacherRepository;
import br.com.ifsp.classify.specifications.ClassroomSpecification;
import br.com.ifsp.classify.specifications.StudentSpecification;
import br.com.ifsp.classify.specifications.SubjectTeacherSpecification;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ClassSessionService extends AbstractService<ClassSession, ClassSessionCreateDTO, ClassSessionGetDTO, ClassSessionUpdateDTO, Long> {

    private final SubjectTeacherRepository subjectTeacherRepository;
    private final ClassroomRepository classroomRepository;
    private final StudentRepository studentRepository;
    private final String START_GREATER_END_MESSAGE = "O horário de início da aula deve ser antes que o horário de encerramento";
    private final String START_EQUALS_END_MESSAGE = "O horário do final da aula não pode ser o mesmo do início";
    private final String UNEXISTING_CLASSROOM_MESSAGE = "Deve ser informado uma sala de aula válida";
    private final String UNEXISTING_SUBJECT_TEACHER_MESSAGE = "Deve ser informado um professor válido";

    public ClassSessionService(ClassSessionRepository repository, SubjectTeacherRepository subjectTeacherRepository,
                               ClassroomRepository classroomRepository, StudentRepository studentRepository) {
        super(repository);
        this.subjectTeacherRepository = subjectTeacherRepository;
        this.classroomRepository = classroomRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    ClassSessionGetDTO returnDTO(ClassSession classSession) {
        if (classSession == null)
            return null;

        return new ClassSessionGetDTO(
                UuidUtils.convertBytesToString(classSession.getUuid()),
                new ClassSessionSubjectTeacherGetDTO(
                        UuidUtils.convertBytesToString(classSession.getSubjectTeacher().getEmployee().getUuid()),
                        classSession.getSubjectTeacher().getEmployee().getName(),
                        UuidUtils.convertBytesToString(classSession.getSubjectTeacher().getSubject().getUuid()),
                        classSession.getSubjectTeacher().getSubject().getDescription()
                ),
                new ClassSessionClassroomGetDTO(
                        UuidUtils.convertBytesToString(classSession.getClassroom().getUuid()),
                        classSession.getClassroom().getName()
                ),
                classSession.getStartTime(),
                classSession.getEndTime(),
                classSession.getStudents()
                        .stream()
                        .map(stud -> new ClassSessionStudentGetDTO( UuidUtils.convertBytesToString(stud.getUuid()), stud.getName() ))
                        .toList()
        );
    }

    @Override
    public ClassSessionGetDTO create(ClassSessionCreateDTO classSessionDTO) {
        if (classSessionDTO == null)
            return null;

        if (classSessionDTO.startTime() == null)
            throw new DtoException("O horário de início da aula não pode ser nulo");
        else if (classSessionDTO.endTime() == null)
            throw new DtoException("O horário do final da aula não pode ser nulo");
        else if (classSessionDTO.startTime().isAfter(classSessionDTO.endTime()))
            throw new DtoException(START_GREATER_END_MESSAGE);
        else if (classSessionDTO.endTime().isEqual(classSessionDTO.startTime()))
            throw new DtoException(START_EQUALS_END_MESSAGE);

        if (Utils.isNullOrEmpty(classSessionDTO.subjectTeacherId()))
            throw new DtoException("Um professor deve ser vinculado à aula");

        if (Utils.isNullOrEmpty(classSessionDTO.classroomId()))
            throw new DtoException("Uma sala deve ser vinculada à aula");

        if (classSessionDTO.studentIds() == null || classSessionDTO.studentIds().isEmpty())
            throw new DtoException("Os alunos que participam dessa aula devem ser informados");

        SubjectTeacher subjectTeacher = subjectTeacherRepository
                .findOne(SubjectTeacherSpecification.getByUUID(classSessionDTO.subjectTeacherId()))
                .orElse(null);

        if (subjectTeacher == null)
            throw new DtoException(UNEXISTING_SUBJECT_TEACHER_MESSAGE);

        Classroom classroom = classroomRepository
                    .findOne(ClassroomSpecification.getByUUID(classSessionDTO.classroomId()))
                    .orElse(null);

        if (classroom == null)
            throw new DtoException(UNEXISTING_CLASSROOM_MESSAGE);

        if (classroom.getDisabled())
            throw new DtoException("A sala informada está desativada");

        List<Student> students = new ArrayList<>();
        for (String uuid : classSessionDTO.studentIds()) {
            Student student = studentRepository
                    .findOne(StudentSpecification.getByUUID(uuid))
                    .orElse(null);

            if (student == null)
                throw new DtoException("Foi informado um ID de aluno inexistente");

            students.add(student);
        }

        ClassSession newClassSession = new ClassSession();
        newClassSession.setUuid(UuidUtils.generateUUID());
        newClassSession.setSubjectTeacher(subjectTeacher);
        newClassSession.setClassroom(classroom);
        newClassSession.setStartTime(classSessionDTO.startTime());
        newClassSession.setEndTime(classSessionDTO.endTime());
        newClassSession.setStudents(students);

        repository.save(newClassSession);

        return returnDTO(newClassSession);
    }

    @Override
    public ClassSessionGetDTO update(String uuid, ClassSessionUpdateDTO classSessionDTO) {
        ClassSession classSession = getEntityById(uuid);
        if (classSession == null || classSessionDTO == null)
            return null;

        if ((classSessionDTO.startTime() != null) && (classSessionDTO.endTime() != null)) {
            if (classSessionDTO.startTime().isAfter(classSessionDTO.endTime()))
                throw new DtoException(START_GREATER_END_MESSAGE);
            else if (classSessionDTO.endTime().isEqual(classSessionDTO.startTime()))
                throw new DtoException(START_EQUALS_END_MESSAGE);

            classSession.setStartTime(classSessionDTO.startTime());
            classSession.setEndTime(classSessionDTO.endTime());
        }
        else if (classSessionDTO.startTime() != null) {
            if (classSessionDTO.startTime().isAfter(classSession.getEndTime()))
                throw new DtoException(START_GREATER_END_MESSAGE);
            else if (classSessionDTO.startTime().isEqual(classSession.getEndTime()))
                throw new DtoException(START_EQUALS_END_MESSAGE);

            classSession.setStartTime(classSessionDTO.startTime());
        }
        else if (classSessionDTO.endTime() != null) {
            if (classSession.getStartTime().isAfter(classSessionDTO.endTime()))
                throw new DtoException(START_GREATER_END_MESSAGE);
            else if (classSession.getStartTime().isEqual(classSessionDTO.endTime()))
                throw new DtoException(START_EQUALS_END_MESSAGE);

            classSession.setEndTime(classSessionDTO.endTime());
        }

        if (!Utils.isNullOrEmpty(classSessionDTO.subjectTeacherId())) {
            SubjectTeacher subjectTeacher = subjectTeacherRepository
                    .findOne(SubjectTeacherSpecification.getByUUID(classSessionDTO.subjectTeacherId()))
                    .orElse(null);

            if (subjectTeacher == null)
                throw new DtoException(UNEXISTING_SUBJECT_TEACHER_MESSAGE);

            classSession.setSubjectTeacher(subjectTeacher);
        }

        if (!Utils.isNullOrEmpty(classSessionDTO.classRoomId())) {
            Classroom classroom = classroomRepository
                    .findOne(ClassroomSpecification.getByUUID(classSessionDTO.classRoomId()))
                    .orElse(null);

            if (classroom == null)
                throw new DtoException(UNEXISTING_CLASSROOM_MESSAGE);

            if (classroom.getDisabled())
                throw new DtoException("A sala informada está desativada");

            classSession.setClassroom(classroom);
        }

        repository.save(classSession);

        return returnDTO(classSession);
    }
}