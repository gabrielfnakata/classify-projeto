package br.com.ifsp.classify.services;

import static br.com.ifsp.classify.services.MailService.escape;
import static br.com.ifsp.classify.services.MailService.firstName;
import static br.com.ifsp.classify.services.MailService.initials;
import static br.com.ifsp.classify.services.MailService.titleCase;

import br.com.ifsp.classify.dtos.create.TeacherMessageCreateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.exceptions.ExceptionCode;
import br.com.ifsp.classify.models.ClassSession;
import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.models.Student;
import br.com.ifsp.classify.utils.Utils;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class TeacherMessageService {

    private static final int MAX_SUBJECT_LENGTH = 150;
    private static final int MAX_MESSAGE_LENGTH = 5000;
    private static final String TEMPLATE = "mail/teacher-message.html";

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("EEEE, d 'de' MMMM 'de' yyyy", MailService.PT_BR);
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    private final MailService mailService;
    private final ClassSessionService classSessionService;
    private final AccessScopeService accessScope;

    public TeacherMessageService(MailService mailService, ClassSessionService classSessionService, AccessScopeService accessScope) {
        this.mailService = mailService;
        this.classSessionService = classSessionService;
        this.accessScope = accessScope;
    }

    public void sendToTeacher(TeacherMessageCreateDTO messageDTO) {
        if (!mailService.isConfigured())
            throw new DtoException(ExceptionCode.INTERNAL_ERROR,
                    "O envio de e-mails não está configurado. Avise a secretaria.");

        if (messageDTO == null || Utils.isNullOrEmpty(messageDTO.sessionUuid()))
            throw new DtoException(ExceptionCode.MISSING_FIELD, "É necessário informar a aula.");

        if (Utils.isNullOrEmpty(messageDTO.subject()))
            throw new DtoException(ExceptionCode.MISSING_FIELD, "É necessário informar o assunto.");

        if (Utils.isNullOrEmpty(messageDTO.message()))
            throw new DtoException(ExceptionCode.MISSING_FIELD, "Escreva a mensagem antes de enviar.");

        if (messageDTO.subject().trim().length() > MAX_SUBJECT_LENGTH)
            throw new DtoException(ExceptionCode.VALIDATION_ERROR,
                    "O assunto pode ter no máximo " + MAX_SUBJECT_LENGTH + " caracteres.");

        if (messageDTO.message().trim().length() > MAX_MESSAGE_LENGTH)
            throw new DtoException(ExceptionCode.VALIDATION_ERROR,
                    "A mensagem pode ter no máximo " + MAX_MESSAGE_LENGTH + " caracteres.");

        ClassSession session = classSessionService.getEntityById(messageDTO.sessionUuid());
        if (session == null)
            throw new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "A aula informada não foi encontrada.");

        accessScope.requireCanViewSession(session);

        Student student = accessScope.currentStudent();
        Employee teacher = session.getSubjectTeacher().getEmployee();
        if (teacher.getUser() == null || Utils.isNullOrEmpty(teacher.getUser().getEmail()))
            throw new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "O professor dessa aula não tem e-mail cadastrado.");

        String studentEmail = (student.getUser() != null) ? student.getUser().getEmail() : student.getEmail();
        studentEmail = Utils.isNullOrEmpty(studentEmail) ? null : studentEmail.toLowerCase();

        String subject = messageDTO.subject().trim();
        String message = messageDTO.message().trim();
        String studentName = titleCase(student.getName());
        String subjectName = titleCase(session.getSubjectTeacher().getSubject().getDescription());
        String classroomName = (session.getClassroom() != null) ? titleCase(session.getClassroom().getName()) : "—";
        String sessionDate = MailService.capitalize(session.getStartTime().format(DATE_FORMAT));
        String sessionTime = session.getStartTime().format(TIME_FORMAT) + " às " + session.getEndTime().format(TIME_FORMAT);

        Map<String, String> values = Map.ofEntries(
                Map.entry("subject", escape(subject)),
                Map.entry("message", escape(message).replace("\n", "<br>")),
                Map.entry("teacherName", escape(firstName(titleCase(teacher.getName())))),
                Map.entry("studentName", escape(studentName)),
                Map.entry("studentFirstName", escape(firstName(studentName))),
                Map.entry("studentInitials", escape(initials(studentName))),
                Map.entry("studentEmail", escape(studentEmail)),
                Map.entry("replySubject", MailService.urlEncode("Re: " + subject)),
                Map.entry("subjectName", escape(subjectName)),
                Map.entry("classroomName", escape(classroomName)),
                Map.entry("sessionDate", escape(sessionDate)),
                Map.entry("sessionTime", escape(sessionTime))
        );

        String text = "Nova mensagem de aluno no Classify\n\n"
                + "Enviado por: " + studentName + (studentEmail != null ? " <" + studentEmail + ">" : "") + "\n"
                + "Aula: " + subjectName + " - " + sessionDate + ", " + sessionTime + " (sala " + classroomName + ")\n\n"
                + "Assunto: " + subject + "\n\n"
                + message + "\n\n"
                + "—\nResponda este e-mail para falar com o aluno.";

        boolean sent = mailService.send(new MailService.Message(
                teacher.getUser().getEmail(), null, studentEmail, studentName, subject, text, TEMPLATE, values));

        if (!sent)
            throw new DtoException(ExceptionCode.INTERNAL_ERROR,
                    "Não foi possível enviar a mensagem agora. Tente novamente mais tarde.");
    }
}
