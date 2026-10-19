package br.com.ifsp.classify.models.form;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "FORM_QUESTION_OPTION")
public class FormQuestionOption {
    @JdbcTypeCode(SqlTypes.BIGINT)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column( nullable = false)
    private UUID uuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private FormQuestion question;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "option_text", nullable = false, length = 255)
    private String optionText;

    @JdbcTypeCode(SqlTypes.BIT)
    @Column(nullable = false)
    private Boolean correct = false;

    @OneToMany(mappedBy = "option")
    private Set<FormAnswer> formAnswers = new LinkedHashSet<>();

    public Set<FormAnswer> getFormAnswers() {
        return formAnswers;
    }

    public void setFormAnswers(Set<FormAnswer> formAnswers) {
        this.formAnswers = formAnswers;
    }

    public Boolean getCorrect() {
        return correct;
    }

    public void setCorrect(Boolean correct) {
        this.correct = correct;
    }

    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public FormQuestion getQuestion() {
        return question;
    }

    public void setQuestion(FormQuestion question) {
        this.question = question;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;

        FormQuestionOption that = (FormQuestionOption) o;
        return uuid.equals(that.getUuid());
    }

    @Override
    public int hashCode() {
        return getUuid().hashCode();
    }
}
