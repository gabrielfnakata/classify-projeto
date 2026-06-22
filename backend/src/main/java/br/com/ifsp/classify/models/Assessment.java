package br.com.ifsp.classify.models;

import java.io.Serializable;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "ASSESSMENT")
public class Assessment implements Serializable {

    @JdbcTypeCode(SqlTypes.TINYINT)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = true, length = 300)
    private String description;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = true, length = 3)
    private String grade;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = true, length = 150)
    private String observation;

    @ManyToOne
    @JoinColumn(name = "class_session_id", nullable = false)
    private ClassSession classSession;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getObservation() {
        return observation;
    }

    public void setObservation(String observation) {
        this.observation = observation;
    }

    public ClassSession getClassSession() {
        return classSession;
    }

    public void setClassSession(ClassSession classSession) {
        this.classSession = classSession;
    }
}