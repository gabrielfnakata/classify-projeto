package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.EmployeeCreateDTO;
import br.com.ifsp.classify.models.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class FuncionarioService extends AbstractService<Employee, EmployeeCreateDTO, Long> {

    public FuncionarioService(JpaRepository<Employee, Long> repository) {
        super(repository);
    }

    @Override
    EmployeeCreateDTO returnDTO(Employee entity) {
        return null;
    }

    @Override
    public EmployeeCreateDTO create(EmployeeCreateDTO entity) {
        return null;
    }

    @Override
    public EmployeeCreateDTO update(Long aLong, EmployeeCreateDTO entity) {
        return null;
    }
}