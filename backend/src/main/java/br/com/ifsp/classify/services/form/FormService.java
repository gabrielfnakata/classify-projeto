package br.com.ifsp.classify.services.form;

import br.com.ifsp.classify.dtos.create.FormCreateDTO;
import br.com.ifsp.classify.dtos.get.FormGetDTO;
import br.com.ifsp.classify.dtos.get.FormInfoGetDTO;
import br.com.ifsp.classify.dtos.get.FormQuestionGetDTO;
import br.com.ifsp.classify.dtos.get.FormQuestionOptionGetDTO;
import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.models.Student;
import br.com.ifsp.classify.models.User;
import br.com.ifsp.classify.models.form.*;
import br.com.ifsp.classify.repositories.UserRepository;
import br.com.ifsp.classify.repositories.form.FormQuestionOptionRepository;
import br.com.ifsp.classify.repositories.form.FormQuestionRepository;
import br.com.ifsp.classify.repositories.form.FormRepository;
import br.com.ifsp.classify.security.AuthenticatedUser;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FormService {
    public UserRepository userRepository;
    public FormRepository formRepository;
    public FormQuestionRepository formQuestionRepository;
    public FormQuestionOptionRepository formQuestionOptionRepository;

    public FormService(
            UserRepository userRepository,
            FormRepository formRepository,
            FormQuestionRepository formQuestionRepository,
            FormQuestionOptionRepository formQuestionOptionRepository
    ) {
        this.userRepository = userRepository;
        this.formQuestionRepository = formQuestionRepository;
        this.formRepository = formRepository;
        this.formQuestionOptionRepository = formQuestionOptionRepository;
    }

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
        // TODO: Adicionar suporte à formulários sem nota
        form.setHasScore(true);

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
                       formQuestionOption.setCorrect(option.isCorrect());
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

    public List<FormGetDTO> getAvailableForms(Student student) {
        List<FormSubmission> availableSubmissions = student.getFormSubmissions();
        return availableSubmissions.stream().map(submission -> {
            Form form = submission.getForm();
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
}
