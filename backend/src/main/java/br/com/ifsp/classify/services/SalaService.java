package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.SalaDTO;
import br.com.ifsp.classify.models.Sala;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class SalaService extends BaseService<Sala, SalaDTO, Integer> {

    public SalaService(JpaRepository<Sala, Integer> repository) {
        super(repository);
    }

    @Override
    SalaDTO returnDTO(Sala entity) {
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