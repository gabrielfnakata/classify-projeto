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
@Table(name = "TELEPHONE")
public class Telephone implements Serializable {

    @JdbcTypeCode(SqlTypes.TINYINT)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = true, length = 3)
    private String country;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = true, length = 5)
    private String ddd;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, unique = true, length = 11)
    private String number;

    @ManyToOne
    @JoinColumn(name = "guardian_id", nullable = true)
    private Guardian guardian;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = true)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = true)
    private Employee employee;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getDdd() {
        return ddd;
    }

    public void setDdd(String ddd) {
        this.ddd = ddd;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public Guardian getGuardian() {
        return guardian;
    }

    public void setGuardian(Guardian guardian) {
        this.guardian = guardian;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }
}