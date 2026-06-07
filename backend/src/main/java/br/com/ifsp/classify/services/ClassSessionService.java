package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.ClassSessionCreateDTO;
import br.com.ifsp.classify.dtos.get.ClassSessionGetDTO;
import br.com.ifsp.classify.dtos.update.ClassSessionUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Class;
import br.com.ifsp.classify.models.ClassSession;
import br.com.ifsp.classify.models.Classroom;
import br.com.ifsp.classify.models.Report;
import br.com.ifsp.classify.models.Student;
import br.com.ifsp.classify.models.SubjectTeacher;
import br.com.ifsp.classify.repositories.ClassRepository;
import br.com.ifsp.classify.repositories.ClassSessionRepository;
import br.com.ifsp.classify.repositories.ClassroomRepository;
import br.com.ifsp.classify.repositories.StudentRepository;
import br.com.ifsp.classify.repositories.SubjectTeacherRepository;
import br.com.ifsp.classify.specifications.ClassSpecification;
import br.com.ifsp.classify.specifications.ClassroomSpecification;
import br.com.ifsp.classify.specifications.StudentSpecification;
import br.com.ifsp.classify.specifications.SubjectTeacherSpecification;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.stereotype.Service;

@Service
public class ClassSessionService extends AbstractService<ClassSession, ClassSessionCreateDTO, ClassSessionGetDTO, ClassSessionUpdateDTO, Long> {

    private final SubjectTeacherRepository subjectTeacherRepository;
    private final ClassroomRepository classroomRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;

    private final SubjectTeacherService subjectTeacherService;
    private final StudentService studentService;
    private final ReportService reportService;
    private final ClassService classService;

    private final String START_GREATER_END_MESSAGE = "O horário de início da aula deve ser antes que o horário de encerramento";
    private final String START_EQUALS_END_MESSAGE = "O horário do final da aula não pode ser o mesmo do início";
    private final String UNEXISTING_SUBJECT_TEACHER_MESSAGE = "Deve ser informado um professor válido";
    private final String UNEXISTING_CLASSROOM_MESSAGE = "Deve ser informado uma sala de aula válida";

    public ClassSessionService(ClassSessionRepository repository, SubjectTeacherRepository subjectTeacherRepository, SubjectTeacherService subjectTeacherService, 
        ClassroomRepository classroomRepository, StudentRepository studentRepository, ClassRepository classRepository, StudentService studentService, ReportService reportService, ClassService classService) {
        super(repository);
        this.subjectTeacherRepository = subjectTeacherRepository;
        this.subjectTeacherService = subjectTeacherService;
        this.classroomRepository = classroomRepository;
        this.studentRepository = studentRepository;
        this.classRepository = classRepository;
        this.studentService = studentService;
        this.reportService = reportService;
        this.classService = classService;
    }

    @Override
    ClassSessionGetDTO returnDTO(ClassSession classSession) {
        if (classSession == null)
            return null;

        return new ClassSessionGetDTO(
                UuidUtils.convertBytesToString(classSession.getUuid()),
                subjectTeacherService.returnDTO(classSession.getSubjectTeacher()),
                UuidUtils.convertBytesToString(classSession.getClassroom().getUuid()),
                classSession.getStartTime(),
                classSession.getEndTime(),
                reportService.returnDTO(classSession.getReport()),
                classService.returnDTO(classSession.getClassSessionClass()),
                studentService.returnDTO(classSession.getStudent())
        );
    }

    @Override
    public ClassSessionGetDTO create(ClassSessionCreateDTO classSessionDTO) {
        if (classSessionDTO == null)
            return null;

        if (Utils.isNullOrEmpty(classSessionDTO.subjectTeacherUuid()))
            throw new DtoException("Um professor deve ser vinculado à aula");
        
        if (Utils.isNullOrEmpty(classSessionDTO.classroomUuid()))
            throw new DtoException("Uma sala deve ser vinculada à aula");

        if (classSessionDTO.startTime() == null) {
            throw new DtoException("O horário de início da aula não pode ser nulo");
        }
        else if (classSessionDTO.endTime() == null) {
            throw new DtoException("O horário do final da aula não pode ser nulo");
        }
        else if (classSessionDTO.startTime().isAfter(classSessionDTO.endTime())) {
            throw new DtoException(START_GREATER_END_MESSAGE);
        }
        else if (classSessionDTO.endTime().isEqual(classSessionDTO.startTime())) {
            throw new DtoException(START_EQUALS_END_MESSAGE);
        }

        if (classSessionDTO.report() != null && Utils.isNullOrEmpty(classSessionDTO.report().content()))
            throw new DtoException("Caso seja informado um relatório, seu conteúdo não pode estar vazio");

        if (Utils.isNullOrEmpty(classSessionDTO.studentUuid()) && Utils.isNullOrEmpty(classSessionDTO.classUuid())) {
            throw new DtoException("Deve ser informado um aluno ou uma turma");
        }
        else if (!Utils.isNullOrEmpty(classSessionDTO.studentUuid()) && !Utils.isNullOrEmpty(classSessionDTO.classUuid())) {
            throw new DtoException("Não é permitido informar uma turma e um aluno");
        }
        
        SubjectTeacher subjectTeacher = subjectTeacherRepository
            .findOne(SubjectTeacherSpecification.getByUUID(classSessionDTO.subjectTeacherUuid()))
            .orElse(null);
        
        if (subjectTeacher == null)
            throw new DtoException(UNEXISTING_SUBJECT_TEACHER_MESSAGE);
        
        Classroom classroom = classroomRepository
            .findOne(ClassroomSpecification.getByUUID(classSessionDTO.classroomUuid()))
            .orElse(null);
        
        if (classroom == null) {
            throw new DtoException(UNEXISTING_CLASSROOM_MESSAGE);
        }
        else if (classroom.getDisabled()) {
            throw new DtoException("A sala informada está desativada");
        }
        
        ClassSession newClassSession = new ClassSession();
        newClassSession.setUuid(UuidUtils.generateUUID());
        newClassSession.setSubjectTeacher(subjectTeacher);
        newClassSession.setClassroom(classroom);
        newClassSession.setStartTime(classSessionDTO.startTime());
        newClassSession.setEndTime(classSessionDTO.endTime());

        Report newReport = new Report();
        newReport.setContent(Utils.trimAndUpper(classSessionDTO.report().content()));
        newClassSession.setReport(newReport);

        if (!Utils.isNullOrEmpty(classSessionDTO.studentUuid())) {
            Student studentFound = studentRepository
                .findOne(StudentSpecification.getByUUID(classSessionDTO.studentUuid()))
                .orElse(null);

            if (studentFound == null)
                throw new DtoException("O aluno informado não foi encontrado ou não foi registrado");

            newClassSession.setStudent(studentFound);
            newClassSession.setClassSessionClass(null);
        }
        else {
            Class classFound = classRepository
                .findOne(ClassSpecification.getByUUID(classSessionDTO.classUuid()))
                .orElse(null);

            if (classFound == null)
                throw new DtoException("A sala informada não foi encontrada ou não foi registrada");

            newClassSession.setClassSessionClass(classFound);
            newClassSession.setStudent(null);
        }

        repository.save(newClassSession);

        return returnDTO(newClassSession);
    }

    @Override
    public ClassSessionGetDTO update(String uuid, ClassSessionUpdateDTO classSessionDTO) {
        ClassSession classSession = getEntityById(uuid);
        if (classSession == null || classSessionDTO == null)
            return null;

        if (!Utils.isNullOrEmpty(classSessionDTO.subjectTeacherId())) {
            SubjectTeacher subjectTeacher = subjectTeacherRepository
                .findOne(SubjectTeacherSpecification.getByUUID(classSessionDTO.subjectTeacherId()))
                .orElse(null);

            if (subjectTeacher == null)
                throw new DtoException(UNEXISTING_SUBJECT_TEACHER_MESSAGE);

            classSession.setSubjectTeacher(subjectTeacher);
        }

        if (!Utils.isNullOrEmpty(classSessionDTO.classroomUuid())) {
            Classroom classroom = classroomRepository
                .findOne(ClassroomSpecification.getByUUID(classSessionDTO.classroomUuid()))
                .orElse(null);

            if (classroom == null) {
                throw new DtoException(UNEXISTING_CLASSROOM_MESSAGE);
            }
            else if (classroom.getDisabled()) {
                throw new DtoException("A sala informada está desativada");
            }

            classSession.setClassroom(classroom);
        }

        if ((classSessionDTO.startTime() != null) && (classSessionDTO.endTime() != null)) {

            if (classSessionDTO.startTime().isAfter(classSessionDTO.endTime())) {
                throw new DtoException(START_GREATER_END_MESSAGE);
            }
            else if (classSessionDTO.endTime().isEqual(classSessionDTO.startTime())) {
                throw new DtoException(START_EQUALS_END_MESSAGE);
            }

            classSession.setStartTime(classSessionDTO.startTime());
            classSession.setEndTime(classSessionDTO.endTime());
        }
        else if (classSessionDTO.startTime() != null) {

            if (classSessionDTO.startTime().isAfter(classSession.getEndTime())) {
                throw new DtoException(START_GREATER_END_MESSAGE);
            }
            else if (classSessionDTO.startTime().isEqual(classSession.getEndTime())) {
                throw new DtoException(START_EQUALS_END_MESSAGE);
            }

            classSession.setStartTime(classSessionDTO.startTime());
        }
        else if (classSessionDTO.endTime() != null) {

            if (classSession.getStartTime().isAfter(classSessionDTO.endTime())) {
                throw new DtoException(START_GREATER_END_MESSAGE);
            }
            else if (classSession.getStartTime().isEqual(classSessionDTO.endTime())) {
                throw new DtoException(START_EQUALS_END_MESSAGE);
            }

            classSession.setEndTime(classSessionDTO.endTime());
        }

        if (classSessionDTO.report() != null) {
            
            if (Utils.isNullOrEmpty(classSessionDTO.report().content()))
                throw new DtoException("Caso seja informado um relatório, seu conteúdo não pode estar vazio");

            classSession.getReport().setContent(Utils.trimAndUpper(classSessionDTO.report().content()));
        }

        if (Utils.isNullOrEmpty(classSessionDTO.studentUuid()) && Utils.isNullOrEmpty(classSessionDTO.classUuid())) {
            throw new DtoException("Deve ser informado um aluno ou uma turma");
        }
        else if (!Utils.isNullOrEmpty(classSessionDTO.studentUuid()) && !Utils.isNullOrEmpty(classSessionDTO.classUuid())) {
            throw new DtoException("Não é permitido informar uma turma e um aluno");
        }
        else if (!Utils.isNullOrEmpty(classSessionDTO.studentUuid())) {

            if (!classSessionDTO.studentUuid().equals(UuidUtils.convertBytesToString(classSession.getStudent().getUuid()))) {
                Student studentFound = studentRepository
                    .findOne(StudentSpecification.getByUUID(classSessionDTO.studentUuid()))
                    .orElse(null);
    
                if (studentFound == null)
                    throw new DtoException("O aluno informado não foi encontrado ou não foi registrado");
    
                classSession.setStudent(studentFound);
                classSession.setClassSessionClass(null);
            }
        }
        else {

            if (!classSessionDTO.classUuid().equals(UuidUtils.convertBytesToString(classSession.getClassSessionClass().getUuid()))) {
                Class classFound = classRepository
                .findOne(ClassSpecification.getByUUID(classSessionDTO.classUuid()))
                .orElse(null);

            if (classFound == null)
                throw new DtoException("A sala informada não foi encontrada ou não foi registrada");

            classSession.setClassSessionClass(classFound);
            classSession.setStudent(null);
            }
        }

        repository.save(classSession);

        return returnDTO(classSession);
    }
}