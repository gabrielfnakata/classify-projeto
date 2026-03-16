package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.AulaDTO;
import br.com.ifsp.classify.models.Aula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class AulaService extends BaseService<Aula, AulaDTO, Long> {

    public AulaService(JpaRepository<Aula, Long> repository) {
        super(repository);
    }

    @Override
    AulaDTO returnDTO(Aula entity) {
        return null;
    }

    @Override
    public AulaDTO create(AulaDTO entity) {
        return null;
    }

    @Override
    public AulaDTO update(Long aLong, AulaDTO entity) {
        return null;
    }
}