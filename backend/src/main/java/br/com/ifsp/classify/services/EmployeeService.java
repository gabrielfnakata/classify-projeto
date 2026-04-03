package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.EmployeeCreateDTO;
import br.com.ifsp.classify.dtos.get.EmployeeGetDTO;
import br.com.ifsp.classify.dtos.get.RoleGetDTO;
import br.com.ifsp.classify.dtos.update.EmployeeUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.models.Role;
import br.com.ifsp.classify.repositories.EmployeeRepository;
import br.com.ifsp.classify.repositories.RoleRepository;
import br.com.ifsp.classify.specifications.RoleSpecification;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class EmployeeService extends AbstractService<Employee, EmployeeCreateDTO, EmployeeGetDTO, EmployeeUpdateDTO, Long> {

    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final String UNEXISTING_ROLE_MESSAGE = "Deve ser informado um cargo válido ao funcionário";

    public EmployeeService(EmployeeRepository repository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        super(repository);
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    EmployeeGetDTO returnDTO(Employee employee) {
        if (employee == null)
            return null;

        return new EmployeeGetDTO(
                UuidUtils.convertBytesToString(employee.getUuid()),
                employee.getName(),
                employee.getCpf(),
                employee.getBirthDate(),
                employee.getEmail(),
                employee.getTelephone(),
                employee.getAddress(),
                new RoleGetDTO(
                        UuidUtils.convertBytesToString(employee.getRole().getUuid()),
                        employee.getRole().getDescription()
                )
        );
    }

    @Override
    public EmployeeGetDTO create(EmployeeCreateDTO employeeDTO) {
        if (employeeDTO == null)
            return null;

        if (Utils.isNullOrEmpty(employeeDTO.name()))
            throw new DtoException("O nome do funcionário não pode ser vazio ou nulo");

        if (employeeDTO.password() == null || employeeDTO.password().isEmpty())
            throw new DtoException("A senha do funcionário não pode ser nula ou vazia");

        if (Utils.isNullOrEmpty(employeeDTO.cpf()))
            throw new DtoException("O CPF do funcionário não pode ser nulo ou vazio");

        if (employeeDTO.birthDate() == null)
            throw new DtoException("É necessário informar a data de nascimento do funcionário");

        if (Utils.isNullOrEmpty(employeeDTO.email()))
            throw new DtoException("O email do funcionário não pode ser nulo ou vazio");

        if (Utils.isNullOrEmpty(employeeDTO.telephone()))
            throw new DtoException("O telefone do funcionário não pode ser nulo ou vazio");

        if (Utils.isNullOrEmpty(employeeDTO.address()))
            throw new DtoException("O endereço do funcionário não pode ser nulo ou vazio");

        if (Utils.isNullOrEmpty(employeeDTO.roleId()))
            throw new DtoException("O cargo do funcionário não pode ser nulo ou vazio");

        Role role = roleRepository
                .findOne(RoleSpecification.getByUUID(employeeDTO.roleId()))
                .orElse(null);

        if (role == null)
            throw new DtoException(UNEXISTING_ROLE_MESSAGE);

        Employee newEmployee = new Employee();
        newEmployee.setUuid(UuidUtils.generateUUID());
        newEmployee.setName(employeeDTO.name().trim().toUpperCase());
        newEmployee.setPassword(passwordEncoder.encode(employeeDTO.password()));
        newEmployee.setCpf(employeeDTO.cpf().trim());
        newEmployee.setBirthDate(employeeDTO.birthDate());
        newEmployee.setEmail(employeeDTO.email().trim().toUpperCase());
        newEmployee.setTelephone(employeeDTO.telephone().trim());
        newEmployee.setAddress(employeeDTO.address().trim());
        newEmployee.setRole(role);

        repository.save(newEmployee);

        return returnDTO(newEmployee);
    }

    @Override
    public EmployeeGetDTO update(String uuid, EmployeeUpdateDTO employeeDTO) {
        Employee employee = getEntityById(uuid);
        if (employee == null || employeeDTO == null)
            return null;

        if (!Utils.isNullOrEmpty(employeeDTO.name()))
            employee.setName(employeeDTO.name().trim().toUpperCase());

        if (employeeDTO.birthDate() != null)
            employee.setBirthDate(employeeDTO.birthDate());

        if (!Utils.isNullOrEmpty(employeeDTO.email()))
            employee.setEmail(employeeDTO.email().trim().toUpperCase());

        if(!Utils.isNullOrEmpty(employeeDTO.address()))
            employee.setAddress(employeeDTO.address().trim());

        if (!Utils.isNullOrEmpty(employeeDTO.cpf()))
            employee.setCpf(employeeDTO.cpf().trim());

        if (!Utils.isNullOrEmpty(employeeDTO.roleId())) {
            Role role = roleRepository
                    .findOne(RoleSpecification.getByUUID(employeeDTO.roleId()))
                    .orElse(null);

            if (role == null)
                throw new DtoException(UNEXISTING_ROLE_MESSAGE);

            employee.setRole(role);
        }

        repository.save(employee);

        return returnDTO(employee);
    }
}