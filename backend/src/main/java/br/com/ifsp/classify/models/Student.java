package br.com.ifsp.classify.models;

import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "STUDENT")
public class Student extends Person implements Serializable {

    @Column(nullable = false)
    private LocalDate registrationDate;

    @ManyToMany
    @JoinTable(
            name = "STUDENT_CLASS_SESSION",
            joinColumns = @JoinColumn(name = "student_id"),
            inverseJoinColumns = @JoinColumn(name = "class_session_id")
    )
    private List<ClassSession> classSessions = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "STUDENT_GUARDIAN",
            joinColumns = @JoinColumn(name = "student_id"),
            inverseJoinColumns = @JoinColumn(name = "guardian_id")
    )
    private List<Guardian> guardians = new ArrayList<>();

    public LocalDate getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDate registrationDate) {
        this.registrationDate = registrationDate;
    }

    public List<ClassSession> getClassSessions() {
        return classSessions;
    }

    public void setClassSessions(List<ClassSession> classSessions) {
        this.classSessions = classSessions;
    }

    public List<Guardian> getGuardians() {
        return guardians;
    }

    public void setGuardians(List<Guardian> guardians) {
        this.guardians = guardians;
    }
}