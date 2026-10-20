package br.com.ifsp.classify.services;

import static br.com.ifsp.classify.services.MailService.escape;
import static br.com.ifsp.classify.services.MailService.firstName;
import static br.com.ifsp.classify.services.MailService.initials;
import static br.com.ifsp.classify.services.MailService.titleCase;

import br.com.ifsp.classify.dtos.create.ClassSessionCreateDTO;
import br.com.ifsp.classify.dtos.create.ReportCreateDTO;
import br.com.ifsp.classify.dtos.create.ScheduleRequestCreateDTO;
import br.com.ifsp.classify.dtos.get.ScheduleRequestPreviewDTO;
import br.com.ifsp.classify.dtos.update.ScheduleRequestAnswerDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.exceptions.ExceptionCode;
import br.com.ifsp.classify.models.Classroom;
import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.models.Student;
import br.com.ifsp.classify.models.SubjectTeacher;
import br.com.ifsp.classify.models.User;
import br.com.ifsp.classify.repositories.ClassroomRepository;
import br.com.ifsp.classify.repositories.StudentRepository;
import br.com.ifsp.classify.repositories.SubjectTeacherRepository;
import br.com.ifsp.classify.repositories.UserRepository;
import br.com.ifsp.classify.security.JwtService;
import br.com.ifsp.classify.security.UserRole;
import br.com.ifsp.classify.specifications.ClassroomSpecification;
import br.com.ifsp.classify.specifications.StudentSpecification;
import br.com.ifsp.classify.specifications.SubjectTeacherSpecification;
import br.com.ifsp.classify.utils.ApplicationClock;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;
import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class ScheduleRequestService {

    private static final String TOKEN_TYPE = "schedule_request";
    private static final String REQUEST_TEMPLATE = "mail/schedule-request.html";
    private static final String ANSWER_TEMPLATE = "mail/schedule-request-answer.html";
    private static final int MAX_MESSAGE_LENGTH = 1000;
    private static final String INVALID_LINK_MESSAGE =
            "Este link de solicitação é inválido ou expirou (o horário pedido já passou).";

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("EEEE, d 'de' MMMM 'de' yyyy", MailService.PT_BR);
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    private final JwtService jwtService;
    private final MailService mailService;
    private final AccessScopeService accessScope;
    private final ClassSessionService classSessionService;
    private final TeacherAvailabilityService availabilityService;
    private final SubjectTeacherRepository subjectTeacherRepository;
    private final StudentRepository studentRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;
    private final ApplicationClock clock;

    public ScheduleRequestService(JwtService jwtService, MailService mailService, AccessScopeService accessScope,
            ClassSessionService classSessionService, TeacherAvailabilityService availabilityService,
            SubjectTeacherRepository subjectTeacherRepository, StudentRepository studentRepository,
            ClassroomRepository classroomRepository, UserRepository userRepository, ApplicationClock clock) {
        this.jwtService = jwtService;
        this.mailService = mailService;
        this.accessScope = accessScope;
        this.classSessionService = classSessionService;
        this.availabilityService = availabilityService;
        this.subjectTeacherRepository = subjectTeacherRepository;
        this.studentRepository = studentRepository;
        this.classroomRepository = classroomRepository;
        this.userRepository = userRepository;
        this.clock = clock;
    }

    public void request(ScheduleRequestCreateDTO requestDTO) {
        if (!mailService.isConfigured())
            throw new DtoException(ExceptionCode.INTERNAL_ERROR,
                    "O envio de e-mails não está configurado. Avise a secretaria.");

        if (requestDTO == null || Utils.isNullOrEmpty(requestDTO.subjectTeacherUuid()))
            throw new DtoException(ExceptionCode.MISSING_FIELD, "Escolha a disciplina e o professor.");

        LocalDateTime start = requestDTO.startTime();
        LocalDateTime end = requestDTO.endTime();
        if (start == null || end == null)
            throw new DtoException(ExceptionCode.MISSING_FIELD, "Informe a data e o horário da aula.");

        if (!start.isBefore(end))
            throw new DtoException(ExceptionCode.INVALID_CLASS_TIME, "O horário de início deve ser antes do fim.");

        if (!start.isAfter(clock.now()))
            throw new DtoException(ExceptionCode.INVALID_CLASS_TIME, "Escolha um horário que ainda não passou.");

        String message = Utils.isNullOrEmpty(requestDTO.message()) ? "" : requestDTO.message().trim();
        if (message.length() > MAX_MESSAGE_LENGTH)
            throw new DtoException(ExceptionCode.VALIDATION_ERROR,
                    "O recado pode ter no máximo " + MAX_MESSAGE_LENGTH + " caracteres.");

        SubjectTeacher subjectTeacher = subjectTeacherRepository
                .findOne(SubjectTeacherSpecification.getByUUID(requestDTO.subjectTeacherUuid()))
                .orElseThrow(() -> new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "Professor ou disciplina não encontrados."));

        Employee teacher = subjectTeacher.getEmployee();
        if (teacher.getUser() == null || Utils.isNullOrEmpty(teacher.getUser().getEmail()))
            throw new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "Esse professor não tem e-mail cadastrado para receber a solicitação.");

        availabilityService.assertAvailable(teacher, start, end);

        Student student = accessScope.currentStudent();
        String studentUuid = UuidUtils.convertBytesToString(student.getUuid());
        String token = jwtService.generateSignedToken(TOKEN_TYPE, studentUuid, clock.toDate(start), Map.of(
                "st", requestDTO.subjectTeacherUuid(),
                "start", start.toString(),
                "end", end.toString()));

        String reviewUrl = mailService.appUrl() + "/schedule-requests/review?token=" + MailService.urlEncode(token);
        String studentName = titleCase(student.getName());
        String studentEmail = studentEmail(student);
        String subjectName = titleCase(subjectTeacher.getSubject().getDescription());

        Map<String, String> values = Map.ofEntries(
                Map.entry("teacherName", escape(firstName(titleCase(teacher.getName())))),
                Map.entry("studentName", escape(studentName)),
                Map.entry("studentInitials", escape(initials(studentName))),
                Map.entry("studentEmail", escape(studentEmail)),
                Map.entry("subjectName", escape(subjectName)),
                Map.entry("sessionDate", escape(formatDate(start))),
                Map.entry("sessionTime", escape(formatTime(start, end))),
                Map.entry("message", message.isEmpty()
                        ? "<span style=\"color:#8a9aa8;\">O aluno não deixou recado.</span>"
                        : escape(message).replace("\n", "<br>")),
                Map.entry("acceptUrl", escape(reviewUrl + "&action=accept")),
                Map.entry("declineUrl", escape(reviewUrl + "&action=decline"))
        );

        String text = "Solicitação de aula no Classify\n\n"
                + studentName + (studentEmail.isEmpty() ? "" : " <" + studentEmail + ">") + " pediu uma aula de " + subjectName + ".\n"
                + "Quando: " + formatDate(start) + ", " + formatTime(start, end) + "\n"
                + (message.isEmpty() ? "" : "Recado: " + message + "\n")
                + "\nAceitar: " + reviewUrl + "&action=accept\n"
                + "Recusar: " + reviewUrl + "&action=decline\n";

        boolean sent = mailService.send(new MailService.Message(
                teacher.getUser().getEmail(), adminEmails(teacher), studentEmail.isEmpty() ? null : studentEmail, studentName,
                "Solicitação de aula: " + subjectName + " com " + studentName, text, REQUEST_TEMPLATE, values));

        if (!sent)
            throw new DtoException(ExceptionCode.INTERNAL_ERROR,
                    "Não foi possível enviar a solicitação agora. Tente novamente mais tarde.");
    }

    public ScheduleRequestPreviewDTO preview(String token) {
        Request request = readRequest(token);
        return new ScheduleRequestPreviewDTO(
                titleCase(request.student().getName()),
                titleCase(request.subjectTeacher().getEmployee().getName()),
                titleCase(request.subjectTeacher().getSubject().getDescription()),
                request.start(),
                request.end());
    }

    public void accept(ScheduleRequestAnswerDTO answerDTO) {
        Request request = readRequest(answerDTO == null ? null : answerDTO.token());

        if (Utils.isNullOrEmpty(answerDTO.classroomUuid()))
            throw new DtoException(ExceptionCode.MISSING_FIELD, "Escolha a sala da aula.");

        classSessionService.create(new ClassSessionCreateDTO(
                UuidUtils.convertBytesToString(request.subjectTeacher().getUuid()),
                answerDTO.classroomUuid(),
                request.start(),
                request.end(),
                new ReportCreateDTO("Aula agendada a pedido do aluno."),
                null,
                UuidUtils.convertBytesToString(request.student().getUuid()),
                null));

        String classroomName = classroomRepository.findOne(ClassroomSpecification.getByUUID(answerDTO.classroomUuid()))
                .map(Classroom::getName).map(MailService::titleCase).orElse("—");

        notifyStudent(request, true, "Sala: " + classroomName, null);
    }

    public void decline(ScheduleRequestAnswerDTO answerDTO) {
        Request request = readRequest(answerDTO == null ? null : answerDTO.token());
        String reason = (answerDTO == null || Utils.isNullOrEmpty(answerDTO.reason())) ? null : answerDTO.reason().trim();
        notifyStudent(request, false, null, reason);
    }

    private record Request(Student student, SubjectTeacher subjectTeacher, LocalDateTime start, LocalDateTime end) {}

    private Request readRequest(String token) {
        Claims claims = Utils.isNullOrEmpty(token) ? null : jwtService.parseSignedToken(token, TOKEN_TYPE).orElse(null);
        if (claims == null)
            throw new DtoException(ExceptionCode.VALIDATION_ERROR, INVALID_LINK_MESSAGE);

        SubjectTeacher subjectTeacher = subjectTeacherRepository
                .findOne(SubjectTeacherSpecification.getByUUID((String) claims.get("st")))
                .orElseThrow(() -> new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "O professor ou a disciplina desta solicitação não existem mais."));

        accessScope.requireTeacherOrAdmin(subjectTeacher.getEmployee());

        Student student = studentRepository.findOne(StudentSpecification.getByUUID(claims.getSubject()))
                .orElseThrow(() -> new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "O aluno desta solicitação não está mais cadastrado."));

        return new Request(student, subjectTeacher,
                LocalDateTime.parse((String) claims.get("start")),
                LocalDateTime.parse((String) claims.get("end")));
    }

    private void notifyStudent(Request request, boolean accepted, String detail, String reason) {
        String studentEmail = studentEmail(request.student());
        if (studentEmail.isEmpty())
            return;

        String subjectName = titleCase(request.subjectTeacher().getSubject().getDescription());
        String teacherName = titleCase(request.subjectTeacher().getEmployee().getName());
        String when = formatDate(request.start()) + ", " + formatTime(request.start(), request.end());

        Map<String, String> values = Map.of(
                "studentName", escape(firstName(titleCase(request.student().getName()))),
                "statusLabel", accepted ? "Aula confirmada" : "Solicitação recusada",
                "statusColor", accepted ? "#1a9a96" : "#c0392b",
                "headline", escape(accepted
                        ? "Sua aula de " + subjectName + " foi confirmada!"
                        : "Sua solicitação de aula de " + subjectName + " não foi aceita."),
                "teacherName", escape(teacherName),
                "subjectName", escape(subjectName),
                "when", escape(when),
                "detail", accepted
                        ? escape(detail) + ". A aula já está na sua agenda no Classify."
                        : (reason == null ? "O professor não informou o motivo. Você pode pedir outro horário."
                                : "Motivo: " + escape(reason)),
                "appUrl", escape(mailService.appUrl())
        );

        String text = (accepted ? "Aula confirmada" : "Solicitação recusada") + "\n\n"
                + subjectName + " com " + teacherName + " — " + when + "\n"
                + (accepted ? detail + ". A aula já está na sua agenda." : (reason == null ? "" : "Motivo: " + reason)) + "\n";

        mailService.send(new MailService.Message(studentEmail, null, null, null,
                (accepted ? "Aula confirmada: " : "Solicitação recusada: ") + subjectName, text, ANSWER_TEMPLATE, values));
    }

    private List<String> adminEmails(Employee teacher) {
        String teacherEmail = teacher.getUser().getEmail();
        return userRepository.findAll((root, query, cb) -> cb.equal(root.get("role").get("id"), UserRole.ADMIN.name()))
                .stream()
                .map(User::getEmail)
                .filter(email -> !Utils.isNullOrEmpty(email) && !email.equalsIgnoreCase(teacherEmail))
                .toList();
    }

    private static String studentEmail(Student student) {
        String email = (student.getUser() != null) ? student.getUser().getEmail() : student.getEmail();
        return Utils.isNullOrEmpty(email) ? "" : email.toLowerCase();
    }

    private static String formatDate(LocalDateTime dateTime) {
        return MailService.capitalize(dateTime.format(DATE_FORMAT));
    }

    private static String formatTime(LocalDateTime start, LocalDateTime end) {
        return start.format(TIME_FORMAT) + " às " + end.format(TIME_FORMAT);
    }
}
