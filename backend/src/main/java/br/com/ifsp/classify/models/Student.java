package br.com.ifsp.classify.models;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "STUDENT")
public class Student extends Person implements Serializable {

    @JdbcTypeCode(SqlTypes.LOCAL_DATE)
    @Column(nullable = false)
    private LocalDate registrationDate;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 100)
    private String neighborhood;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 255)
    private String school;

    @JdbcTypeCode(SqlTypes.TINYINT)
    @Column(nullable = false)
    private Integer grade;

    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false)
    private Boolean referral;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = true, length = 255)
    private String referrerName;

    @OneToMany(mappedBy = "student", cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    private List<Guardian> guardians = new ArrayList<>();

    public LocalDate getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDate registrationDate) {
        this.registrationDate = registrationDate;
    }

    public String getNeighborhood() {
        return neighborhood;
    }

    public void setNeighborhood(String neighborhood) {
        this.neighborhood = neighborhood;
    }

    public String getSchool() {
        return school;
    }

    public void setSchool(String school) {
        this.school = school;
    }

    public Integer getGrade() {
        return grade;
    }

    public void setGrade(Integer grade) {
        this.grade = grade;
    }

    public Boolean getReferral() {
        return referral;
    }

    public void setReferral(Boolean referral) {
        this.referral = referral;
    }

    public String getReferrerName() {
        return referrerName;
    }

    public void setReferrerName(String referrerName) {
        this.referrerName = referrerName;
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