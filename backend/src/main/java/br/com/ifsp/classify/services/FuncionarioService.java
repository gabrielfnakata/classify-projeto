package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.FuncionarioDTO;
import br.com.ifsp.classify.models.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class FuncionarioService extends BaseService<Funcionario, FuncionarioDTO, Long> {

    public FuncionarioService(JpaRepository<Funcionario, Long> repository) {
        super(repository);
    }

    @Override
    FuncionarioDTO returnDTO(Funcionario entity) {
        return null;
    }

    @Override
    public FuncionarioDTO create(FuncionarioDTO entity) {
        return null;
    }

    @Override
    public FuncionarioDTO update(Long aLong, FuncionarioDTO entity) {
        return null;
    }
}