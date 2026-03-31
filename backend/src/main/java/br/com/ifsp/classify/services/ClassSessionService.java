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
import br.com.ifsp.classify.models.SubjectTeacher;
import br.com.ifsp.classify.repositories.ClassSessionRepository;
import br.com.ifsp.classify.repositories.ClassroomRepository;
import br.com.ifsp.classify.repositories.SubjectTeacherRepository;
import br.com.ifsp.classify.specifications.ClassroomSpecification;
import br.com.ifsp.classify.specifications.SubjectTeacherSpecification;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.stereotype.Service;

@Service
public class ClassSessionService extends AbstractService<ClassSession, ClassSessionCreateDTO, ClassSessionGetDTO, ClassSessionUpdateDTO, Long> {

    private final SubjectTeacherRepository subjectTeacherRepository;
    private final ClassroomRepository classroomRepository;
    private final String START_GREATER_END_MESSAGE = "O horário de início da aula deve ser antes que o horário de encerramento";
    private final String START_EQUALS_END_MESSAGE = "O horário do final da aula não pode ser o mesmo do início";
    private final String UNEXISTING_CLASSROOM_MESSAGE = "Deve ser informado uma sala de aula válida";
    private final String UNEXISTING_SUBJECT_TEACHER_MESSAGE = "Deve ser informado um professor válido";

    public ClassSessionService(ClassSessionRepository repository, SubjectTeacherRepository subjectTeacherRepository,
                               ClassroomRepository classroomRepository) {
        super(repository);
        this.subjectTeacherRepository = subjectTeacherRepository;
        this.classroomRepository = classroomRepository;
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

        SubjectTeacher subjectTeacher;
        if (Utils.isNullOrEmpty(classSessionDTO.subjectTeacherId()))
            throw new DtoException("Um professor deve ser vinculado à aula");
        else {
            subjectTeacher = subjectTeacherRepository
                    .findOne(SubjectTeacherSpecification.getByUUID(classSessionDTO.subjectTeacherId()))
                    .orElse(null);

            if (subjectTeacher == null)
                throw new DtoException(UNEXISTING_SUBJECT_TEACHER_MESSAGE);
        }

        Classroom classroom;
        if (Utils.isNullOrEmpty(classSessionDTO.classroomId()))
            throw new DtoException("Uma sala deve ser vinculada à aula");
        else {
            classroom = classroomRepository
                    .findOne(ClassroomSpecification.getByUUID(classSessionDTO.classroomId()))
                    .orElse(null);

            if (classroom == null)
                throw new DtoException(UNEXISTING_CLASSROOM_MESSAGE);
        }

        ClassSession newClassSession = new ClassSession();
        newClassSession.setUuid(UuidUtils.generateUUID());
        newClassSession.setSubjectTeacher(subjectTeacher);
        newClassSession.setClassroom(classroom);
        newClassSession.setStartTime(classSessionDTO.startTime());
        newClassSession.setEndTime(classSessionDTO.endTime());

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

            classSession.setClassroom(classroom);
        }

        repository.save(classSession);

        return returnDTO(classSession);
    }
}