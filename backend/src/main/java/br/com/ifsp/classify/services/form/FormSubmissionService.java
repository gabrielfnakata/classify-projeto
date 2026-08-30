package br.com.ifsp.classify.services.form;

import br.com.ifsp.classify.dtos.create.FormAnswerCreateDTO;
import br.com.ifsp.classify.dtos.create.FormSubmissionCreateDTO;
import br.com.ifsp.classify.models.form.*;
import br.com.ifsp.classify.repositories.form.FormAnswerRepository;
import br.com.ifsp.classify.repositories.form.FormQuestionOptionRepository;
import br.com.ifsp.classify.repositories.form.FormQuestionRepository;
import br.com.ifsp.classify.repositories.form.FormSubmissionRepository;
import br.com.ifsp.classify.utils.Utils;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FormSubmissionService {
    public FormSubmissionRepository formSubmissionRepository;
    public FormQuestionRepository formQuestionRepository;
    public FormAnswerRepository formAnswerRepository;
    public FormQuestionOptionRepository formQuestionOptionRepository;

    public FormSubmissionService(
            FormSubmissionRepository formSubmissionRepository,
            FormQuestionRepository formQuestionRepository,
            FormAnswerRepository formAnswerRepository,
            FormQuestionOptionRepository formQuestionOptionRepository
    ) {
        this.formSubmissionRepository = formSubmissionRepository;
        this.formQuestionRepository = formQuestionRepository;
        this.formAnswerRepository = formAnswerRepository;
        this.formQuestionOptionRepository = formQuestionOptionRepository;
    }

    public void markSubmissionStart(String uuid) {
        FormSubmission formSubmission = formSubmissionRepository.getByUuid(UUID.fromString(uuid)).orElseThrow();
        formSubmission.setStartedAt(LocalDateTime.now());
        formSubmissionRepository.save(formSubmission);
    }

    @Transactional
    public void saveFormSubmission(String uuid, FormSubmissionCreateDTO dto) {
        FormSubmission formSubmission = formSubmissionRepository.getByUuid(UUID.fromString(uuid)).orElseThrow();
        List<FormAnswerCreateDTO> answers = dto.answers();

        Set<UUID> questionUuids = answers.stream()
                .map(a -> UUID.fromString(a.questionUuid()))
                .collect(Collectors.toSet());

        Set<UUID> optionUuids = answers.stream()
                .filter(a -> a.optionUuid() != null)
                .map(answerDTO -> UUID.fromString(answerDTO.optionUuid()))
                .collect(Collectors.toSet());

        List<FormQuestion> questions = formQuestionRepository.findAllByUuidIn(questionUuids);
        List<FormQuestionOption> options = formQuestionOptionRepository.findAllByUuidIn(optionUuids);

        Map<UUID, FormQuestion> questionsByUuid = Utils.mountIndexedMap(questions, FormQuestion::getUuid);
        Map<UUID, FormQuestionOption> optionsByUuid = Utils.mountIndexedMap(options, FormQuestionOption::getUuid);

        List<FormAnswer> formAnswers = answers
                .stream()
                .map(answer -> {
                    FormQuestion question = questionsByUuid.get(UUID.fromString(answer.questionUuid()));
                    if (question == null) {
                        throw new EntityNotFoundException("Pergunta não encontrada: " + answer.questionUuid());
                    }

                    FormAnswer formAnswer = new FormAnswer();
                    formAnswer.setUuid(UUID.randomUUID());
                    formAnswer.setSubmission(formSubmission);
                    formAnswer.setQuestion(question);

                    if (question.getTypeAnswer() == AnswerType.TEXT) {
                        formAnswer.setAnswerText(answer.answerText());
                    } else {
                        FormQuestionOption option = optionsByUuid.get(UUID.fromString(answer.optionUuid()));
                        if (option == null) {
                            throw new EntityNotFoundException("Opção não encontrada: " + answer.optionUuid());
                        }
                        formAnswer.setOption(option);
                    }

                    return formAnswer;
                }).toList();

        formSubmission.setFormAnswer(formAnswers);
        formSubmission.setStatus(FormStatus.ANSWERED);
        formSubmission.setSubmittedAt(LocalDateTime.now());
        formSubmissionRepository.save(formSubmission);
    }
}
