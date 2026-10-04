package br.com.ifsp.classify.models.form;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "FORM_QUESTION")
public class FormQuestion {
    @JdbcTypeCode(SqlTypes.BIGINT)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id")
    private Form form;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "uuid", nullable = false, length = 16)
    private UUID uuid;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "question", nullable = false, length = 255)
    private String question;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_answer", nullable = false, length = 50)
    private AnswerType typeAnswer;

    @OneToMany(mappedBy = "question", fetch = FetchType.LAZY)
    private Set<FormAnswer> formAnswers;

    @OneToMany(mappedBy = "question", fetch = FetchType.LAZY)
    private Set<FormQuestionOption> formQuestionOptions;

    @JdbcTypeCode(SqlTypes.BIT)
    private Boolean isRequired;

    public Set<FormQuestionOption> getFormQuestionOptions() {
        return formQuestionOptions;
    }

    public void setFormQuestionOptions(Set<FormQuestionOption> formQuestionOptions) {
        this.formQuestionOptions = formQuestionOptions;
    }

    public Set<FormAnswer> getFormAnswers() {
        return formAnswers;
    }

    public void setFormAnswers(Set<FormAnswer> formAnswers) {
        this.formAnswers = formAnswers;
    }

    public AnswerType getTypeAnswer() {
        return typeAnswer;
    }

    public void setTypeAnswer(AnswerType typeAnswer) {
        this.typeAnswer = typeAnswer;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public Form getForm() {
        return form;
    }

    public void setForm(Form form) {
        this.form = form;
    }

    public Boolean getRequired() {
        return isRequired;
    }

    public void setRequired(Boolean required) {
        isRequired = required;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;

        FormQuestion that = (FormQuestion) o;
        return getUuid().equals(that.getUuid());
    }

    @Override
    public int hashCode() {
        return getUuid().hashCode();
    }
}
