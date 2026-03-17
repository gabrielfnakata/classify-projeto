package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.SalaDTO;
import br.com.ifsp.classify.models.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class SalaService extends BaseService<Classroom, SalaDTO, Integer> {

    public SalaService(JpaRepository<Classroom, Integer> repository) {
        super(repository);
    }

    @Override
    SalaDTO returnDTO(Classroom entity) {
        return null;
    }

    @Override
    public SalaDTO create(SalaDTO entity) {
        return null;
    }

    @Override
    public SalaDTO update(Integer integer, SalaDTO entity) {
        return null;
    }
}