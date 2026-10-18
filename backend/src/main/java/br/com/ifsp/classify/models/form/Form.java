package br.com.ifsp.classify.models.form;

import br.com.ifsp.classify.models.Employee;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "FORM")
public class Form {
    @JdbcTypeCode(SqlTypes.BIGINT)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(nullable = false, length = 16)
    private UUID uuid;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Employee teacher;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 255)
    private String title;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 255)
    private String description;

    @JdbcTypeCode(SqlTypes.LOCAL_DATE_TIME)
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @JdbcTypeCode(SqlTypes.LOCAL_DATE_TIME)
    @Column(nullable = false)
    private LocalDateTime limitDate;

    @JdbcTypeCode(SqlTypes.BIT)
    @Column(nullable = false)
    private Boolean hasScore = false;

    @OneToMany(mappedBy = "form")
    private Set<FormQuestion> formQuestions = new LinkedHashSet<>();

    @OneToMany(mappedBy = "form")
    private Set<FormSubmission> formSubmissions = new LinkedHashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public Employee getTeacher() {
        return teacher;
    }

    public void setTeacher(Employee teacher) {
        this.teacher = teacher;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLimitDate() {
        return limitDate;
    }

    public void setLimitDate(LocalDateTime limitDate) {
        this.limitDate = limitDate;
    }

    public Boolean getHasScore() {
        return hasScore;
    }

    public void setHasScore(Boolean hasScore) {
        this.hasScore = hasScore;
    }

    public Set<FormQuestion> getFormQuestions() {
        return formQuestions;
    }

    public void setFormQuestions(Set<FormQuestion> formQuestions) {
        this.formQuestions = formQuestions;
    }

    public Set<FormSubmission> getFormSubmissions() {
        return formSubmissions;
    }

    public void setFormSubmissions(Set<FormSubmission> formSubmissions) {
        this.formSubmissions = formSubmissions;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;

        Form form = (Form) o;
        return getUuid().equals(form.getUuid());
    }

    @Override
    public int hashCode() {
        return getUuid().hashCode();
    }
}
