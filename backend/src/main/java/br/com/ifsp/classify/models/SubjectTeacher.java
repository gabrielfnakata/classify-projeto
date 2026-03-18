package br.com.ifsp.classify.models;

import jakarta.persistence.*;

import java.io.Serializable;

@Entity
@Table(name = "SUBJECT_TEACHER")
public class SubjectTeacher implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Byte[] uuid;

    @ManyToOne
    @JoinColumn(name = "id")
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "id")
    private Subject subject;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Byte[] getUuid() {
        return uuid;
    }

    public void setUuid(Byte[] uuid) {
        this.uuid = uuid;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }
}