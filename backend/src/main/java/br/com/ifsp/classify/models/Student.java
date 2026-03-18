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

    @ManyToMany(mappedBy = "students")
    private List<ClassSession> classSessions = new ArrayList<>();

    @OneToMany
    @JoinColumn(name = "student_id")
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