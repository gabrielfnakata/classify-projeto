package br.com.ifsp.classify.services.form;

import br.com.ifsp.classify.dtos.create.*;
import br.com.ifsp.classify.dtos.get.AnswerFileUploadDTO;
import br.com.ifsp.classify.dtos.update.FormAnswerCorrectionDTO;
import br.com.ifsp.classify.dtos.update.FormCorrectionScoreUpdateDTO;
import br.com.ifsp.classify.models.form.*;
import br.com.ifsp.classify.repositories.form.*;
import br.com.ifsp.classify.services.FileStorageService;
import br.com.ifsp.classify.utils.Utils;
import io.minio.MinioClient;
import io.minio.RemoveObjectArgs;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FormSubmissionService {

    private static final Map<AnswerType, Long> MAX_SIZE_BY_TYPE = Map.of(
            AnswerType.IMAGE, 1024L * 1024L, // 1MB
            AnswerType.FILE, 5L * 1024L * 1024L // 5MB
    );

    public FormSubmissionRepository formSubmissionRepository;
    public FormQuestionRepository formQuestionRepository;
    public FormAnswerRepository formAnswerRepository;
    public FormQuestionOptionRepository formQuestionOptionRepository;
    public FormAnswerFileRepository formAnswerFileRepository;

    public FileStorageService fileStorageService;

    public MinioClient minioClient;

    public FormSubmissionService(
            FormSubmissionRepository formSubmissionRepository,
            FormQuestionRepository formQuestionRepository,
            FormAnswerRepository formAnswerRepository,
            FormQuestionOptionRepository formQuestionOptionRepository,
            FileStorageService fileStorageService,
            FormAnswerFileRepository formAnswerFileRepository,
            MinioClient minioClient
    ) {
        this.formSubmissionRepository = formSubmissionRepository;
        this.formQuestionRepository = formQuestionRepository;
        this.formAnswerRepository = formAnswerRepository;
        this.formQuestionOptionRepository = formQuestionOptionRepository;
        this.fileStorageService = fileStorageService;
        this.formAnswerFileRepository = formAnswerFileRepository;
        this.minioClient = minioClient;
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

                    switch (question.getTypeAnswer()) {
                        case TEXT -> formAnswer.setAnswerText(answer.answerText());
                        case IMAGE, FILE -> {
                            List<AnswerFile> files = buildPendingFiles(answer.answerFiles(), formAnswer);
                            formAnswer.setFiles(files);
                        }
                        case SELECT, MULTI_SELECT -> {
                            FormQuestionOption option = optionsByUuid.get(UUID.fromString(answer.optionUuid()));
                            if (option == null) {
                                throw new EntityNotFoundException("Opção não encontrada: " + answer.optionUuid());
                            }
                            formAnswer.setOption(option);
                            formAnswer.setCorrect(option.getCorrect());
                        }
                    }

                    return formAnswer;
                }).toList();

        formSubmission.setFormAnswer(formAnswers);
        formSubmission.setStatus(FormStatus.ANSWERED);
        formSubmission.setSubmittedAt(LocalDateTime.now());
        formSubmissionRepository.save(formSubmission);
    }

    private List<AnswerFile> buildPendingFiles(List<AnswerFileSubmissionDTO> dtos, FormAnswer formAnswer) {
        if (dtos == null) return List.of();

        return dtos.stream().map(dto -> {
            AnswerFile file = new AnswerFile();
            file.setUuid(UUID.fromString(dto.uuid()));
            file.setFileName(dto.fileName());
            file.setFormAnswer(formAnswer);
            file.setStatus(UploadStatus.PENDING);
            return file;
        }).toList();
    }

    public void correctFormAnswer(FormAnswerCorrectionDTO dto) {
        FormAnswer answerToBeCorrected = formAnswerRepository.findByUuid(UUID.fromString(dto.uuid())).orElseThrow();
        answerToBeCorrected.setCorrect(dto.correct());
        answerToBeCorrected.setTeacherFeedback(dto.feedback());
        formAnswerRepository.save(answerToBeCorrected);
    }

    public void finishCorrection(FormCorrectionScoreUpdateDTO dto) {
        FormSubmission submission = formSubmissionRepository.getByUuid(UUID.fromString(dto.uuid())).orElseThrow();
        submission.setCorrectedAt(LocalDateTime.now());
        submission.setStatus(FormStatus.CORRECTED);
        submission.setScore(BigDecimal.valueOf(dto.score()));
        formSubmissionRepository.save(submission);
    }

    public AnswerFileUploadDTO generateUploadUrl(@Valid AnswerFileCreateDTO dto) throws Exception {
        String uuid = UUID.randomUUID().toString();
        String key = uuid + "." + dto.fileName();
        String uploadUrl = fileStorageService.generateUploadUrl(dto.bucket(), key);
        return new AnswerFileUploadDTO(
                uuid,
                uploadUrl
        );
    }

    public void handleUploadConfirmation(ConfirmAnswerFileUploadDTO dto) {
        dto.records().forEach(record -> {
            String bucket = record.s3().bucket().name();
            String key = record.s3().object().key();
            long size = record.s3().object().size();

            UUID uuid = getUUIDFromKey(key);
            if (uuid == null) { return; }

            AnswerFile file = formAnswerFileRepository.findByUuid(uuid).orElse(null);
            if (file == null || file.getStatus() != UploadStatus.PENDING) {
                return;
            }

            AnswerType type = file.getFormAnswer().getQuestion().getTypeAnswer();
            long maxSize = MAX_SIZE_BY_TYPE.getOrDefault(type, Long.MAX_VALUE);

            if (size > maxSize) {
                try {
                    minioClient.removeObject(RemoveObjectArgs.builder().bucket(bucket).object(key).build());
                } catch (Exception e) {}
                file.setStatus(UploadStatus.FAILED);
            } else {
                file.setFileSize(size);
                file.setStatus(UploadStatus.FINISHED);
            }
        });
    }

    private UUID getUUIDFromKey(String key) {
        try {
            UUID uuid = UUID.fromString(key.split(".")[0]);
            return uuid;
        } catch (Exception e) {
            return null;
        }
    }
}
