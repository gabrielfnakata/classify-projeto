package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.FuncionarioDTO;
import br.com.ifsp.classify.models.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class FuncionarioService extends BaseService<Employee, FuncionarioDTO, Long> {

    public FuncionarioService(JpaRepository<Employee, Long> repository) {
        super(repository);
    }

    @Override
    FuncionarioDTO returnDTO(Employee entity) {
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