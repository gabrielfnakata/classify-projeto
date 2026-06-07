package br.com.ifsp.classify.services;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.ifsp.classify.dtos.create.EmployeeCreateDTO;
import br.com.ifsp.classify.dtos.create.TelephoneCreateDTO;
import br.com.ifsp.classify.dtos.get.EmployeeGetDTO;
import br.com.ifsp.classify.dtos.update.EmployeeUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.models.Telephone;
import br.com.ifsp.classify.models.User;
import br.com.ifsp.classify.repositories.EmployeeRepository;
import br.com.ifsp.classify.repositories.RoleRepository;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;

@Service
public class EmployeeService extends AbstractService<Employee, EmployeeCreateDTO, EmployeeGetDTO, EmployeeUpdateDTO, Long> {

    private final TelephoneService telephoneService;
    private final UserService userService;

    public EmployeeService(EmployeeRepository repository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, TelephoneService telephoneService, UserService userService) {
        super(repository);
        this.telephoneService = telephoneService;
        this.userService = userService;
    }

    @Override
    EmployeeGetDTO returnDTO(Employee employee) {
        if (employee == null)
            return null;

        return new EmployeeGetDTO(
                UuidUtils.convertBytesToString(employee.getUuid()),
                employee.getName(),
                employee.getBirthDate(),
                employee.getCpf(),
                employee.getHireDate(),
                employee.getTelephones()
                    .stream()
                    .map(telephone -> telephoneService.returnDTO(telephone))
                    .toList(),
                UuidUtils.convertBytesToString(employee.getUuid())
        );
    }

    @Override
    public EmployeeGetDTO create(EmployeeCreateDTO employeeDTO) {
        if (employeeDTO == null)
            return null;

        if (Utils.isNullOrEmpty(employeeDTO.name()))
            throw new DtoException("O nome do funcionário não pode ser vazio ou nulo");

        if (Utils.isNullOrEmpty(employeeDTO.cpf())) {
            throw new DtoException("O CPF do funcionário não pode ser nulo ou vazio");
        }
        else if (!Utils.cpfValidator(employeeDTO.cpf())) {
            throw new DtoException("O CPF informado é inválido");
        }

        Employee newEmployee = new Employee();
        newEmployee.setUuid(UuidUtils.generateUUID());
        newEmployee.setName(Utils.trimAndUpper(employeeDTO.name()));
        newEmployee.setBirthDate(employeeDTO.birthDate());
        newEmployee.setCpf(Utils.removeAllNonDigits(employeeDTO.cpf()));
        newEmployee.setHireDate(employeeDTO.hireDate());
            
        User newUser = userService.createUserFromEmployee(employeeDTO.user());
        newEmployee.setUser(newUser);

        if (Utils.hasElements(employeeDTO.telephones())) {
            for (TelephoneCreateDTO telephone : employeeDTO.telephones()) {
                Telephone newTelephone = telephoneService.create(telephone);

                if (newTelephone != null)
                    newEmployee.addTelephone(newTelephone);
            }
        }

        repository.save(newEmployee);

        return returnDTO(newEmployee);
    }

    @Override
    public EmployeeGetDTO update(String employeeUuid, EmployeeUpdateDTO employeeDTO) {
        Employee employee = getEntityById(employeeUuid);
        if (employee == null || employeeDTO == null)
            return null;

        if (!Utils.isNullOrEmpty(employeeDTO.name()))
            employee.setName(Utils.trimAndUpper(employeeDTO.name()));

        if (employeeDTO.birthDate() != null)
            employee.setBirthDate(employeeDTO.birthDate());

        if (!Utils.isNullOrEmpty(employeeDTO.cpf()) && Utils.cpfValidator(employeeDTO.cpf()))
            employee.setCpf(Utils.removeAllNonDigits(employeeDTO.cpf()));

        if (employeeDTO.hireDate() != null)
            employee.setHireDate(employeeDTO.hireDate());

        if (employeeDTO.user() != null) {
            User userUpdated = userService.updateUser(employeeUuid, employeeDTO.user());

            if (userUpdated == null)
                throw new DtoException("Erro ao atualizar o usuário");    
            
            employee.setUser(userUpdated);
        }

        repository.save(employee);

        return returnDTO(employee);
    }
}