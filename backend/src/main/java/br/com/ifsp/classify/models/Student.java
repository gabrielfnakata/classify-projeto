package br.com.ifsp.classify.models;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "STUDENT")
public class Student extends Person implements Serializable {

    @JdbcTypeCode(SqlTypes.LOCAL_DATE)
    @Column(nullable = false)
    private LocalDate registrationDate;

    @OneToMany(mappedBy = "student")
    private List<Guardian> guardians = new ArrayList<>();

    public LocalDate getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDate registrationDate) {
        this.registrationDate = registrationDate;
    }

    public List<Guardian> getGuardians() {
        return guardians;
    }

    public void setGuardians(List<Guardian> guardians) {
        this.guardians = guardians;
    }

    public void addGuardian(Guardian guardian) {
        guardians.add(guardian);
        guardian.setStudent(this);
    }
}