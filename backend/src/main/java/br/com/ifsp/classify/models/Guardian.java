package br.com.ifsp.classify.models;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "GUARDIAN")
public class Guardian {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Byte[] uuid;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 11)
    private String telephone;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }
}