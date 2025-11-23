package br.com.ifsp.classify.models;

import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Aula implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "idProfessorDisciplina")
    private ProfessorDisciplina professorDisciplina;

    @ManyToOne
    @JoinColumn(name = "idSala")
    private Sala sala;

    private LocalDateTime horarioInicio;
    private LocalDateTime horarioFim;

    @ManyToMany(mappedBy = "aulas")
    private List<Aluno> alunos = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ProfessorDisciplina getProfessorDisciplina() {
        return professorDisciplina;
    }

    public void setProfessorDisciplina(ProfessorDisciplina professorDisciplina) {
        this.professorDisciplina = professorDisciplina;
    }

    public Sala getSala() {
        return sala;
    }

    public void setSala(Sala sala) {
        this.sala = sala;
    }

    public LocalDateTime getHorarioInicio() {
        return horarioInicio;
    }

    public void setHorarioInicio(LocalDateTime horarioInicio) {
        this.horarioInicio = horarioInicio;
    }

    public LocalDateTime getHorarioFim() {
        return horarioFim;
    }

    public void setHorarioFim(LocalDateTime horarioFim) {
        this.horarioFim = horarioFim;
    }

    public List<Aluno> getAlunos() {
        return alunos;
    }

    public void setAlunos(List<Aluno> alunos) {
        this.alunos = alunos;
    }
}