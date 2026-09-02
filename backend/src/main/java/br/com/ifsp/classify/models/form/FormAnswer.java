package br.com.ifsp.classify.models.form;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "FORM_ANSWER")
public class FormAnswer {
    @JdbcTypeCode(SqlTypes.BIGINT)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "uuid", nullable = false)
    private UUID uuid;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    private FormSubmission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private FormQuestion question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id")
    private FormQuestionOption option;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "answer_text", length = 500)
    private String answerText;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "teacher_feedback", length = 500)
    private String teacherFeedback;

    @JdbcTypeCode(SqlTypes.BIT)
    private Boolean correct;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "file_name", length = 255)
    private String fileName;

    public String getTeacherFeedback() {
        return teacherFeedback;
    }

    public void setTeacherFeedback(String teacherFeedback) {
        this.teacherFeedback = teacherFeedback;
    }

    public String getAnswerText() {
        return answerText;
    }

    public void setAnswerText(String answerText) {
        this.answerText = answerText;
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public FormQuestionOption getOption() {
        return option;
    }

    public void setOption(FormQuestionOption option) {
        this.option = option;
    }

    public FormQuestion getQuestion() {
        return question;
    }

    public void setQuestion(FormQuestion question) {
        this.question = question;
    }

    public FormSubmission getSubmission() {
        return submission;
    }

    public void setSubmission(FormSubmission submission) {
        this.submission = submission;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Boolean getCorrect() {
        return correct;
    }

    public void setCorrect(Boolean correct) {
        this.correct = correct;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;

        FormAnswer that = (FormAnswer) o;
        return getUuid().equals(that.getUuid());
    }

    @Override
    public int hashCode() {
        return getUuid().hashCode();
    }
}
