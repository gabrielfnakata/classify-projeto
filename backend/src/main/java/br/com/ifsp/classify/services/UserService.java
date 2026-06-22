package br.com.ifsp.classify.services;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.ifsp.classify.dtos.create.UserCreateDTO;
import br.com.ifsp.classify.dtos.get.RoleGetDTO;
import br.com.ifsp.classify.dtos.get.UserGetDTO;
import br.com.ifsp.classify.dtos.update.UserUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.models.Role;
import br.com.ifsp.classify.models.User;
import br.com.ifsp.classify.repositories.EmployeeRepository;
import br.com.ifsp.classify.repositories.RoleRepository;
import br.com.ifsp.classify.repositories.UserRepository;
import br.com.ifsp.classify.specifications.EmployeeSpecification;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;

@Service
public class UserService extends AbstractService<User, UserCreateDTO, UserGetDTO, UserUpdateDTO, Long> {

    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeRepository employeeRepository;

    public UserService(UserRepository repository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, EmployeeRepository employeeRepository) {
        super(repository);
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.employeeRepository = employeeRepository;
    }

    @Override
    UserGetDTO returnDTO(User user) {
        if (user == null)
            return null;

        return new UserGetDTO(
            UuidUtils.convertBytesToString(user.getUuid()),
            user.getEmail(),
            user.getRefreshToken(),
            new RoleGetDTO(
                null,
                user.getRole().getDescription()
            )
        );
    }

    @Override
    public UserGetDTO create(UserCreateDTO userDTO) {
        if (userDTO == null)
            return null;

        if (Utils.isNullOrEmpty(userDTO.email()))
            throw new DtoException("É necessário informar o email do usuário");

        if (Utils.isNullOrEmpty(userDTO.password()))
            throw new DtoException("É necessário informar a senha do usuário");

        Role role;
        if (Utils.isNullOrEmpty(userDTO.roleId())) {
            throw new DtoException("É necessário informar o cargo do usuário");
        }
        else {
            role = roleRepository
                .findById(userDTO.roleId())
                .orElse(null);

            if (role == null)
                throw new DtoException("O cargo informado não existe");
        }

        Employee employee;
        if (Utils.isNullOrEmpty(userDTO.employeeUuid())) {
            throw new DtoException("É necessário informar um funcionário");
        }
        else {
            employee = employeeRepository
                .findOne(EmployeeSpecification.getByUUID(userDTO.employeeUuid()))
                .orElse(null);
            
            if (employee == null)
                throw new DtoException("O funcionário informado não existe");
        }

        User newUser = new User();
        newUser.setUuid(UuidUtils.generateUUID());
        newUser.setEmail(Utils.trimAndUpper(userDTO.email()));
        newUser.setPassword(passwordEncoder.encode(userDTO.password()));
        newUser.setRole(role);
        newUser.setCreatedAt(LocalDateTime.now());
        employee.setUser(newUser);

        repository.save(newUser);

        return returnDTO(newUser);
    }

    public User createUserFromEmployee(UserCreateDTO userDTO) {
        if (userDTO == null)
            return null;

        if (Utils.isNullOrEmpty(userDTO.email()))
            throw new DtoException("É necessário informar o email do usuário");

        if (Utils.isNullOrEmpty(userDTO.password()))
            throw new DtoException("É necessário informar a senha do usuário");

        Role role;
        if (Utils.isNullOrEmpty(userDTO.roleId())) {
            throw new DtoException("É necessário informar o cargo do usuário");
        }
        else {
            role = roleRepository
                .findById(userDTO.roleId())
                .orElse(null);

            if (role == null)
                throw new DtoException("O cargo informado não existe");
        }

        User newUser = new User();
        newUser.setUuid(UuidUtils.generateUUID());
        newUser.setEmail(Utils.trimAndUpper(userDTO.email()));
        newUser.setPassword(passwordEncoder.encode(userDTO.password()));
        newUser.setRole(role);
        newUser.setCreatedAt(LocalDateTime.now());

        return newUser;
    }

    @Override
    public UserGetDTO update(String userUuid, UserUpdateDTO userDTO) {
        User user = getEntityById(userUuid);
        if (user == null || userDTO == null)
            return null;

        if (!Utils.isNullOrEmpty(userDTO.email()))
            user.setEmail(Utils.trimAndUpper(userDTO.email()));

        if (!Utils.isNullOrEmpty(userDTO.roleId())) {
            Role role = roleRepository
                .findById(userDTO.roleId())
                .orElse(null);

            if (role == null)
                throw new DtoException("O cargo informado não existe");

            user.setRole(role);
        }

        repository.save(user);

        return returnDTO(user);
    }

    public User updateUser(String userUuid, UserUpdateDTO userDTO) {
        User user = getEntityById(userUuid);
        if (user == null || userDTO == null)
            return null;

        if (!Utils.isNullOrEmpty(userDTO.email()))
            user.setEmail(Utils.trimAndUpper(userDTO.email()));

        if (!Utils.isNullOrEmpty(userDTO.roleId())) {
            Role role = roleRepository
                .findById(userDTO.roleId())
                .orElse(null);

            if (role == null)
                throw new DtoException("O cargo informado não existe");

            user.setRole(role);
        }

        return user;
    }
}