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
public class Student implements Serializable {

    @JdbcTypeCode(SqlTypes.TINYINT)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(nullable = false, unique = true)
    private byte[] uuid;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 255)
    private String name;

    @JdbcTypeCode(SqlTypes.DATE)
    @Column(nullable = false)
    private LocalDate birthDate;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = true, unique = true, length = 320)
    private String email;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(nullable = true, unique = true, length = 11)
    private String cpf;

    @JdbcTypeCode(SqlTypes.DATE)
    @Column(nullable = false)
    private LocalDate registrationDate;

    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false)
    private Boolean isDeleted = false;

    @ManyToMany
    @JoinTable(
        name = "STUDENT_GUARDIAN",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "guardian_id")
    )
    private List<Guardian> guardians = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "STUDENT_CLASS",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "class_id")
    )
    private List<Class> classes = new ArrayList<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Telephone> telephones = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public byte[] getUuid() {
        return uuid;
    }

    public void setUuid(byte[] uuid) {
        this.uuid = uuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public LocalDate getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDate registrationDate) {
        this.registrationDate = registrationDate;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public List<Guardian> getGuardians() {
        return guardians;
    }

    public void setGuardians(List<Guardian> guardians) {
        this.guardians = guardians;
    }

    public List<Class> getClasses() {
        return classes;
    }

    public void setClasses(List<Class> classes) {
        this.classes = classes;
    }

    public List<Telephone> getTelephones() {
        return telephones;
    }

    public void setTelephones(List<Telephone> telephones) {
        this.telephones = telephones;
    }

    public void addGuardian(Guardian guardian) {
        if (guardians.add(guardian)) {
            guardian.addStudent(this);
        }
    }

    public void addTelephone(Telephone telephone) {
        telephones.add(telephone);
        telephone.setStudent(this);
    }
}