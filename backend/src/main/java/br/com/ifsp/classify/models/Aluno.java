package br.com.ifsp.classify.models;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.Set;

@Entity
public class Aluno extends Usuario {

    @Column(nullable = false)
    private LocalDate dataMatricula;

    private String nomeResponsavel;
    private String telefoneResponsavel;

    @ManyToMany
    @JoinTable(
            name = "idAluno",
            joinColumns = @JoinColumn(name = "idAluno"),
            inverseJoinColumns = @JoinColumn(name = "idAula")
    )
    Set<Aula> aulas;

    public LocalDate getDataMatricula() {
        return dataMatricula;
    }

    public void setDataMatricula(LocalDate dataMatricula) {
        this.dataMatricula = dataMatricula;
    }

    public String getNomeResponsavel() {
        return nomeResponsavel;
    }

    public void setNomeResponsavel(String nomeResponsavel) {
        this.nomeResponsavel = nomeResponsavel;
    }

    public String getTelefoneResponsavel() {
        return telefoneResponsavel;
    }

    public void setTelefoneResponsavel(String telefoneResponsavel) {
        this.telefoneResponsavel = telefoneResponsavel;
    }
}