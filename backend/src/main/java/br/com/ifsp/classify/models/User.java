package br.com.ifsp.classify.models;

import java.io.Serializable;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "USER")
public class User implements Serializable {

    @JdbcTypeCode(SqlTypes.TINYINT)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(nullable = false, unique = true)
    private byte[] uuid;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, unique = true, length = 320)
    private String email;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 100)
    private String password;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = true, unique = true, length = 255)
    private String refreshToken;

    @JdbcTypeCode(SqlTypes.LOCAL_DATE_TIME)
    @Column(nullable = true)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;


    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Employee employee;

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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Employee getEmployee() { return employee; }

    public void setEmployee(Employee employee) { this.employee = employee; }
}
