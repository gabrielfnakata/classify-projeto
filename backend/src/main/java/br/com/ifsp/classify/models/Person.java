package br.com.ifsp.classify.models;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;

@MappedSuperclass
public abstract class Person {

    @JdbcTypeCode(SqlTypes.BIGINT)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(nullable = false, unique = true, length = 16)
    private byte[] uuid;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 255)
    private String name;

    @JdbcTypeCode(SqlTypes.LOCAL_DATE)
    @Column(nullable = false)
    private LocalDate birthDate;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, unique = true, length = 320)
    private String email;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(nullable = false, length = 11)
    private String telephone;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 200)
    private String address;

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

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}