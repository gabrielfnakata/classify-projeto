package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.EmployeeCreateDTO;
import br.com.ifsp.classify.dtos.get.EmployeeGetDTO;
import br.com.ifsp.classify.dtos.update.EmployeeUpdateDTO;
import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.repositories.EmployeeRepository;
import org.springframework.stereotype.Service;

@Service
public class EmployeeService extends AbstractService<Employee, EmployeeCreateDTO, EmployeeGetDTO, EmployeeUpdateDTO, Long> {

    public EmployeeService(EmployeeRepository repository) {
        super(repository);
    }

    @Override
    EmployeeGetDTO returnDTO(Employee entity) {
        return null;
    }

    @Override
    public EmployeeGetDTO create(EmployeeCreateDTO entity) {
        return null;
    }

    @Override
    public EmployeeGetDTO update(String uuid, EmployeeUpdateDTO entity) {
        return null;
    }
}