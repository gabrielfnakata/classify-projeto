package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.AttendanceBulkSaveDTO;
import br.com.ifsp.classify.dtos.AttendanceRecordInputDTO;
import br.com.ifsp.classify.dtos.create.AttendanceCreateDTO;
import br.com.ifsp.classify.dtos.get.AttendanceGetDTO;
import br.com.ifsp.classify.dtos.get.AttendanceRosterEntryDTO;
import br.com.ifsp.classify.dtos.get.AttendanceSessionStatusDTO;
import br.com.ifsp.classify.dtos.update.AttendanceUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Attendance;
import br.com.ifsp.classify.models.ClassSession;
import br.com.ifsp.classify.models.Student;
import br.com.ifsp.classify.repositories.AttendanceRepository;
import br.com.ifsp.classify.repositories.ClassSessionRepository;
import br.com.ifsp.classify.specifications.AttendanceSpecification;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AttendanceService extends AbstractService<Attendance, AttendanceCreateDTO, AttendanceGetDTO, AttendanceUpdateDTO, Long> {

    private static final List<String> VALID_STATUSES = List.of("PRESENTE", "AUSENTE");
    private static final List<String> VALID_JUSTIFICATION_REASONS = List.of(
            "ATESTADO_MEDICO", "PROBLEMA_FAMILIAR", "TRANSPORTE", "OUTRO"
    );

    private final ClassSessionService classSessionService;
    private final ClassSessionRepository classSessionRepository;
    private final StudentService studentService;

    public AttendanceService(AttendanceRepository repository, ClassSessionService classSessionService,
            ClassSessionRepository classSessionRepository, StudentService studentService) {
        super(repository);
        this.classSessionService = classSessionService;
        this.classSessionRepository = classSessionRepository;
        this.studentService = studentService;
    }

    @Override
    AttendanceGetDTO returnDTO(Attendance attendance) {
        if (attendance == null)
            return null;

        return new AttendanceGetDTO(
                UuidUtils.convertBytesToString(attendance.getUuid()),
                UuidUtils.convertBytesToString(attendance.getClassSession().getUuid()),
                UuidUtils.convertBytesToString(attendance.getStudent().getUuid()),
                attendance.getStudent().getName(),
                attendance.getStatus(),
                attendance.getJustificationReason(),
                attendance.getJustificationNote()
        );
    }

    @Override
    public AttendanceGetDTO create(AttendanceCreateDTO attendanceDTO) {
        if (attendanceDTO == null)
            return null;

        ClassSession session = classSessionService.getEntityById(attendanceDTO.classSessionUuid());
        if (session == null)
            throw new DtoException("A aula informada não foi encontrada");

        Student student = studentService.getEntityById(attendanceDTO.studentUuid());
        if (student == null)
            throw new DtoException("O aluno informado não foi encontrado ou não foi registrado");

        if (!resolveRosterStudentIds(session).contains(student.getId()))
            throw new DtoException("O aluno informado não pertence a essa aula");

        if (repository.findOne(AttendanceSpecification.getBySessionAndStudent(session.getId(), student.getId())).isPresent())
            throw new DtoException("Já existe um registro de frequência para esse aluno nessa aula");

        Attendance attendance = new Attendance();
        attendance.setUuid(UuidUtils.generateUUID());
        attendance.setClassSession(session);
        attendance.setStudent(student);
        applyStatusAndJustification(attendance, attendanceDTO.status(), attendanceDTO.justificationReason(), attendanceDTO.justificationNote());

        repository.save(attendance);

        return returnDTO(attendance);
    }

    @Override
    public AttendanceGetDTO update(String uuid, AttendanceUpdateDTO attendanceDTO) {
        Attendance attendance = getEntityById(uuid);
        if (attendance == null || attendanceDTO == null)
            return null;

        applyStatusAndJustification(attendance, attendanceDTO.status(), attendanceDTO.justificationReason(), attendanceDTO.justificationNote());

        repository.save(attendance);

        return returnDTO(attendance);
    }

    public List<AttendanceRosterEntryDTO> getRosterForSession(String sessionUuid) {
        ClassSession session = classSessionService.getEntityById(sessionUuid);
        if (session == null)
            return null;

        List<Student> rosterStudents = resolveRosterStudents(session);

        Map<Long, Attendance> attendanceByStudentId = repository
                .findAll(AttendanceSpecification.getByClassSessionId(session.getId()))
                .stream()
                .collect(Collectors.toMap(a -> a.getStudent().getId(), a -> a));

        return rosterStudents.stream()
                .map(student -> {
                    Attendance attendance = attendanceByStudentId.get(student.getId());
                    return new AttendanceRosterEntryDTO(
                            UuidUtils.convertBytesToString(student.getUuid()),
                            student.getName(),
                            attendance == null ? null : UuidUtils.convertBytesToString(attendance.getUuid()),
                            attendance == null ? null : attendance.getStatus(),
                            attendance == null ? null : attendance.getJustificationReason(),
                            attendance == null ? null : attendance.getJustificationNote()
                    );
                })
                .toList();
    }

    public List<AttendanceSessionStatusDTO> getStatusForAllSessions() {
        List<ClassSession> sessions = classSessionRepository.findAll();

        Map<Long, Long> markedCountBySessionId = repository.findAll()
                .stream()
                .filter(a -> a.getStatus() != null)
                .collect(Collectors.groupingBy(a -> a.getClassSession().getId(), Collectors.counting()));

        return sessions.stream()
                .map(session -> new AttendanceSessionStatusDTO(
                        UuidUtils.convertBytesToString(session.getUuid()),
                        resolveRosterStudents(session).size(),
                        markedCountBySessionId.getOrDefault(session.getId(), 0L).intValue()
                ))
                .toList();
    }

    public List<AttendanceGetDTO> bulkSaveForSession(String sessionUuid, AttendanceBulkSaveDTO body) {
        if (body == null || !Utils.hasElements(body.records()))
            return null;

        ClassSession session = classSessionService.getEntityById(sessionUuid);
        if (session == null)
            throw new DtoException("A aula informada não foi encontrada");

        Set<Long> rosterStudentIds = resolveRosterStudentIds(session);

        List<AttendanceGetDTO> result = new ArrayList<>();
        for (AttendanceRecordInputDTO record : body.records()) {
            Student student = studentService.getEntityById(record.studentUuid());
            if (student == null)
                throw new DtoException("O aluno informado não foi encontrado ou não foi registrado");

            if (!rosterStudentIds.contains(student.getId()))
                throw new DtoException("O aluno informado não pertence a essa aula");

            Attendance attendance = repository
                    .findOne(AttendanceSpecification.getBySessionAndStudent(session.getId(), student.getId()))
                    .orElseGet(Attendance::new);

            if (attendance.getUuid() == null) {
                attendance.setUuid(UuidUtils.generateUUID());
                attendance.setClassSession(session);
                attendance.setStudent(student);
            }

            applyStatusAndJustification(attendance, record.status(), record.justificationReason(), record.justificationNote());

            repository.save(attendance);
            result.add(returnDTO(attendance));
        }

        return result;
    }

    private void applyStatusAndJustification(Attendance attendance, String status, String justificationReason, String justificationNote) {
        if (Utils.isNullOrEmpty(status) || !VALID_STATUSES.contains(status.trim().toUpperCase()))
            throw new DtoException("O status da frequência deve ser PRESENTE ou AUSENTE");

        String normalizedStatus = status.trim().toUpperCase();
        attendance.setStatus(normalizedStatus);

        if (!normalizedStatus.equals("AUSENTE")) {
            attendance.setJustificationReason(null);
            attendance.setJustificationNote(null);
            return;
        }

        if (!Utils.isNullOrEmpty(justificationReason) && !VALID_JUSTIFICATION_REASONS.contains(justificationReason.trim().toUpperCase()))
            throw new DtoException("Motivo de justificativa inválido");

        attendance.setJustificationReason(Utils.isNullOrEmpty(justificationReason) ? null : justificationReason.trim().toUpperCase());
        attendance.setJustificationNote(Utils.isNullOrEmpty(justificationNote) ? null : justificationNote.trim());
    }

    private Set<Long> resolveRosterStudentIds(ClassSession session) {
        return resolveRosterStudents(session).stream().map(Student::getId).collect(Collectors.toSet());
    }

    private List<Student> resolveRosterStudents(ClassSession session) {
        if (session.getStudent() != null)
            return List.of(session.getStudent());

        if (session.getClassSessionClass() != null)
            return session.getClassSessionClass().getStudents();

        return List.of();
    }
}
