package br.com.ifsp.classify.models;

import jakarta.persistence.*;

import java.io.Serializable;

@Entity
@Table(name = "EMPLOYEE")
public class Employee extends Person implements Serializable {

    @Column(nullable = false, length = 30)
    private String password;

    @Column(nullable = false, unique = true, length = 11)
    private String cpf;

    @ManyToOne
    @JoinColumn(name = "id", nullable = false)
    private Role cargo;

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public Role getCargo() {
        return cargo;
    }

    public void setCargo(Role cargo) {
        this.cargo = cargo;
    }
}