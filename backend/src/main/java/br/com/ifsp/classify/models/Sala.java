package br.com.ifsp.classify.models;

import jakarta.persistence.*;

import java.io.Serializable;

@Entity
public class Sala implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private Integer vagas;

    @Column(nullable = false)
    private Integer capacidade;

    @Column(nullable = false)
    private Boolean estaDesativada;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Integer getVagas() {
        return vagas;
    }

    public void setVagas(Integer vagas) {
        this.vagas = vagas;
    }

    public Integer getCapacidade() {
        return capacidade;
    }

    public void setCapacidade(Integer capacidade) {
        this.capacidade = capacidade;
    }

    public Boolean getEstaDesativada() {
        return estaDesativada;
    }

    public void setEstaDesativada(Boolean estaDesativada) {
        this.estaDesativada = estaDesativada;
    }
}