package br.com.ifsp.classify.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Funcionario extends Usuario {

    @Column(unique = true, nullable = false)
    private String cpf;

    @ManyToOne
    @JoinColumn(name = "idCargo")
    private Cargo cargo;

    @Column(nullable = false)
    private Boolean isAdministrador;

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public Cargo getCargo() {
        return cargo;
    }

    public void setCargo(Cargo cargo) {
        this.cargo = cargo;
    }

    public Boolean getAdministrador() {
        return isAdministrador;
    }

    public void setAdministrador(Boolean administrador) {
        isAdministrador = administrador;
    }
}