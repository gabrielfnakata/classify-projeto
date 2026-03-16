package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.ProfessorDisciplinaDTO;
import br.com.ifsp.classify.models.ProfessorDisciplina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class ProfessorDisciplinaService extends BaseService<ProfessorDisciplina, ProfessorDisciplinaDTO, Long> {

    public ProfessorDisciplinaService(JpaRepository<ProfessorDisciplina, Long> repository) {
        super(repository);
    }

    @Override
    ProfessorDisciplinaDTO returnDTO(ProfessorDisciplina entity) {
        return null;
    }

    @Override
    public ProfessorDisciplinaDTO create(ProfessorDisciplinaDTO entity) {
        return null;
    }

    @Override
    public ProfessorDisciplinaDTO update(Long aLong, ProfessorDisciplinaDTO entity) {
        return null;
    }
}