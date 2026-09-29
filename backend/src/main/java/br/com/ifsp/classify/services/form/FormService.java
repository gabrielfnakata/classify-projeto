package br.com.ifsp.classify.services.form;

import br.com.ifsp.classify.dtos.create.*;
import br.com.ifsp.classify.dtos.get.*;
import br.com.ifsp.classify.models.Class;
import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.models.Student;
import br.com.ifsp.classify.models.User;
import br.com.ifsp.classify.models.form.*;
import br.com.ifsp.classify.repositories.ClassRepository;
import br.com.ifsp.classify.repositories.StudentRepository;
import br.com.ifsp.classify.repositories.UserRepository;
import br.com.ifsp.classify.repositories.form.FormQuestionOptionRepository;
import br.com.ifsp.classify.repositories.form.FormQuestionRepository;
import br.com.ifsp.classify.repositories.form.FormRepository;
import br.com.ifsp.classify.repositories.form.FormSubmissionRepository;
import br.com.ifsp.classify.security.AuthenticatedUser;
import br.com.ifsp.classify.services.FileStorageService;
import br.com.ifsp.classify.utils.UuidUtils;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class FormService {
    public UserRepository userRepository;
    public StudentRepository studentRepository;
    public FormRepository formRepository;
    public FormQuestionRepository formQuestionRepository;
    public FormQuestionOptionRepository formQuestionOptionRepository;
    public FormSubmissionRepository formSubmissionRepository;
    public ClassRepository classRepository;
    public FileStorageService fileStorageService;

    public FormService(
            UserRepository userRepository,
            StudentRepository studentRepository,
            FormRepository formRepository,
            FormQuestionRepository formQuestionRepository,
            FormQuestionOptionRepository formQuestionOptionRepository,
            FormSubmissionRepository formSubmissionRepository,
            ClassRepository classRepository,
            FileStorageService fileStorageService
    ) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.formQuestionRepository = formQuestionRepository;
        this.formRepository = formRepository;
        this.formQuestionOptionRepository = formQuestionOptionRepository;
        this.formSubmissionRepository = formSubmissionRepository;
        this.classRepository = classRepository;
        this.fileStorageService = fileStorageService;
    }

    private final String ANSWER_FILES_BUCKET = "form.answers";

    public FormGetDTO create(FormCreateDTO dto, String teacherEmail) {
        User teacher = userRepository.findByEmail(teacherEmail).orElseThrow();
        Form form = new Form();
        List<FormQuestion> formQuestions = new ArrayList<>();
        List<FormQuestionOption> formQuestionOptions = new ArrayList<>();
        form.setUuid(UUID.randomUUID());
        form.setTitle(dto.title());
        form.setDescription(dto.description());
        form.setCreatedAt(LocalDateTime.now());
        form.setTeacher(teacher.getEmployee());
        form.setLimitDate(LocalDateTime.of(dto.limitDate(), LocalTime.MIDNIGHT));
        form.setHasScore(dto.hasScore());

        dto.questions()
            .forEach(question -> {
               FormQuestion formQuestion = new FormQuestion();
               formQuestion.setUuid(UUID.randomUUID());
               formQuestion.setQuestion(question.question());
               formQuestion.setTypeAnswer(question.answerType());
               formQuestion.setRequired(question.isRequired());
               formQuestion.setForm(form);

               if ((question.answerType().equals(AnswerType.SELECT)
                       || question.answerType().equals(AnswerType.MULTI_SELECT))
                       && question.options() != null) {
                   question.options().forEach(option -> {
                       FormQuestionOption formQuestionOption = new FormQuestionOption();
                       formQuestionOption.setUuid(UUID.randomUUID());
                       formQuestionOption.setOptionText(option.optionText());
                       formQuestionOption.setCorrect(option.correct());
                       formQuestionOption.setQuestion(formQuestion);
                       formQuestionOptions.add(formQuestionOption);
                   });
               }

                formQuestions.add(formQuestion);
        });

        formRepository.save(form);
        formQuestionRepository.saveAll(formQuestions);
        formQuestionOptionRepository.saveAll(formQuestionOptions);

        return new FormGetDTO(
                form.getUuid().toString(),
                form.getTitle(),
                form.getDescription(),
                form.getTeacher().getName(),
                form.getFormQuestions().size(),
                form.getCreatedAt().toLocalDate(),
                form.getLimitDate().toLocalDate(),
                form.getHasScore(),
                0.0f,
                FormStatus.PENDING
        );
    }

    public List<FormGetDTO> getForms(AuthenticatedUser auth) {
        User user = userRepository.findByEmail(auth.username()).orElseThrow();
        return switch (auth.role()) {
            case "PROFE", "ADMIN" -> getPostedForms(user.getEmployee());
            // case "ALUNO" -> getAvailableForms(user.getStudent());
            default -> throw new IllegalStateException("Role não suportada: " + auth.role());
        };
    }

    public List<FormGetDTO> getPostedForms(Employee employee) {
        List<Form> forms = formRepository.getAllFromEmployee(employee);
        List<FormGetDTO> formGetDTOs = new ArrayList<>();

        forms.forEach(form -> {
            FormGetDTO dto = new FormGetDTO(
                    form.getUuid().toString(),
                    form.getTitle(),
                    form.getDescription(),
                    form.getTeacher().getName(),
                    form.getFormQuestions().size(),
                    form.getCreatedAt().toLocalDate(),
                    form.getLimitDate().toLocalDate(),
                    form.getHasScore(),
                    0.0f,
                    FormStatus.PENDING
            );
            formGetDTOs.add(dto);
        });
        return formGetDTOs;
    }

    public List<FormGetDTO> getAvailableForms() {
        Student student = studentRepository.findById(1L).orElseThrow();
        List<FormSubmission> availableSubmissions = student.getFormSubmissions();
        return availableSubmissions.stream().map(submission -> {
            Form form = submission.getForm();
            return new FormGetDTO(
                    submission.getUuid().toString(),
                    form.getTitle(),
                    form.getDescription(),
                    form.getTeacher().getName(),
                    form.getFormQuestions().size(),
                    form.getCreatedAt().toLocalDate(),
                    form.getLimitDate().toLocalDate(),
                    form.getHasScore(),
                    0.0f,
                    submission.getStatus()
            );
        }).toList();
    }

    public FormInfoGetDTO getFormInfo(String uuid) {
        Form form = formRepository.findByUuid(UUID.fromString(uuid)).orElseThrow();
        return new FormInfoGetDTO(
                form.getTitle(),
                form.getDescription(),
                form.getFormQuestions().stream().map(question -> {
                    return new FormQuestionGetDTO(
                            question.getUuid().toString(),
                            form.getUuid().toString(),
                            question.getQuestion(),
                            question.getTypeAnswer(),
                            question.getRequired(),
                            question.getTypeAnswer() != AnswerType.TEXT
                                ? question.getFormQuestionOptions()
                                .stream()
                                .map(option -> new FormQuestionOptionGetDTO(
                                        option.getUuid().toString(),
                                        option.getOptionText(),
                                        option.getCorrect()
                                )).toList()
                                : new ArrayList<>()
                    );
                }).toList()
        );
    }

    public List<FormSubmissionGetDTO> getFormSubmissions(String formUuid) {
        Form form = formRepository.findByUuid(UUID.fromString(formUuid)).orElseThrow();
        return form.getFormSubmissions().stream().map(submission -> new FormSubmissionGetDTO(
                submission.getUuid().toString(),
                form.getUuid().toString(),
                form.getTitle(),
                UuidUtils.convertBytesToString(submission.getStudent().getUuid()),
                submission.getStudent().getName(),
                submission.getFormAnswer().stream()
                        .flatMap(this::toFormAnswerGetDTOs)
                        .toList(),
                submission.getStatus(),
                submission.getStartedAt(),
                submission.getSubmittedAt(),
                submission.getCorrectedAt(),
                submission.getScore()
        )).toList();
    }


    public void sendFormsToStudents(AssignFormToStudentsDTO dto) {
        Form form = formRepository.findByUuid(UUID.fromString(dto.formUuid())).orElseThrow();
        List<byte[]> studentsUuids = dto.students()
                .stream().map(student -> UuidUtils.convertUUIDToBytes(student.uuid())).toList();
        List<Student> students = studentRepository.findByUuidIsIn(studentsUuids);

        createSubmissionsForStudents(form, students);
    }

    public void sendFormToClass(AssignFormToClassDTO dto) {
        Form form = formRepository.findByUuid(UUID.fromString(dto.formUuid())).orElseThrow();
        Class clazz = classRepository.findByUuid(UuidUtils.convertUUIDToBytes(dto.classUuid())).orElseThrow();

        createSubmissionsForStudents(form, clazz.getStudents());
    }

    private void createSubmissionsForStudents(Form form, List<Student> students) {
        if (students.isEmpty()) {
            throw new EntityNotFoundException();
        }

        List<Long> studentIds = students.stream().map(Student::getId).toList();
        List<Long> alreadyAssignedIds = formSubmissionRepository
                .findExistingStudentIdsByFormAndStudents(form.getId(), studentIds);

        List<FormSubmission> submissionsToCreate = students.stream()
                .filter(student -> !alreadyAssignedIds.contains(student.getId()))
                .map(student -> {
                    FormSubmission submission = new FormSubmission();
                    submission.setUuid(UUID.randomUUID());
                    submission.setForm(form);
                    submission.setStudent(student);
                    submission.setStatus(FormStatus.PENDING);
                    return submission;
                })
                .toList();

        if (!submissionsToCreate.isEmpty()) {
            formSubmissionRepository.saveAll(submissionsToCreate);
        }
    }

    @Transactional
    public void makeFormCorrection(FormCorrectionCreateDTO dto) {
        FormSubmission submission = formSubmissionRepository
                .getByUuid(UUID.fromString(dto.formSubmissionUuid())).orElseThrow();
        Map<String, FormFeedbackCreateDTO> feedbacks = dto.formFeedbacks().stream()
                .collect(Collectors.toMap(FormFeedbackCreateDTO::questionUuid, Function.identity()));
        submission.getFormAnswer().forEach(answer -> {
            FormFeedbackCreateDTO feedback = feedbacks.get(answer.getQuestion().getUuid().toString());

            answer.setTeacherFeedback(feedback.teacherFeedback());
            answer.setCorrect(feedback.correct());
        });

        submission.setScore(BigDecimal.valueOf(dto.score()));
        formSubmissionRepository.save(submission);
    }

    private Stream<FormAnswerGetDTO> toFormAnswerGetDTOs(FormAnswer answer) {
        String questionUuid = answer.getQuestion().getUuid().toString();
        String optionUuid = answer.getOption() != null
                ? answer.getOption().getUuid().toString()
                : null;

        if (answer.getFiles() != null && !answer.getFiles().isEmpty()) {
            return answer.getFiles().stream().map(file -> {
                String key = file.getUuid() + "." + file.getFileName();
                return new FormAnswerGetDTO(
                        file.getUuid().toString(),
                        questionUuid,
                        optionUuid,
                        answer.getAnswerText(),
                        resolveFileUrl(key),
                        answer.getTeacherFeedback(),
                        answer.getCorrect()
                );
            });
        }

        return Stream.of(new FormAnswerGetDTO(
                answer.getUuid().toString(),
                questionUuid,
                optionUuid,
                answer.getAnswerText(),
                null,
                answer.getTeacherFeedback(),
                answer.getCorrect()
        ));
    }


    private String resolveFileUrl(String key) {
        try {
            return fileStorageService.generateDownloadUrl(ANSWER_FILES_BUCKET, key);
        } catch (Exception e) {
            throw new RuntimeException("Falha ao gerar URL de download para " + key, e);
        }
    }

}
