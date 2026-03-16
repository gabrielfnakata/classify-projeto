package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.DisciplinaDTO;
import br.com.ifsp.classify.models.Disciplina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class DisciplinaService extends BaseService<Disciplina, DisciplinaDTO, Integer> {

    public DisciplinaService(JpaRepository<Disciplina, Integer> repository) {
        super(repository);
    }

    @Override
    DisciplinaDTO returnDTO(Disciplina entity) {
        return null;
    }

    @Override
    public DisciplinaDTO create(DisciplinaDTO entity) {
        return null;
    }

    @Override
    public DisciplinaDTO update(Integer integer, DisciplinaDTO entity) {
        return null;
    }
}