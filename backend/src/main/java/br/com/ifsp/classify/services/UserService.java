package br.com.ifsp.classify.services;

import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.ifsp.classify.dtos.create.UserCreateDTO;
import br.com.ifsp.classify.dtos.get.CurrentUserGetDTO;
import br.com.ifsp.classify.dtos.create.StudentAccountCreateDTO;
import br.com.ifsp.classify.dtos.filter.UserFilterDTO;
import br.com.ifsp.classify.dtos.get.RoleGetDTO;
import br.com.ifsp.classify.dtos.get.UserGetDTO;
import br.com.ifsp.classify.dtos.update.PasswordUpdateDTO;
import br.com.ifsp.classify.dtos.update.UserUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.exceptions.ExceptionCode;
import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.models.Role;
import br.com.ifsp.classify.models.User;
import br.com.ifsp.classify.repositories.EmployeeRepository;
import br.com.ifsp.classify.repositories.RoleRepository;
import br.com.ifsp.classify.repositories.UserRepository;
import br.com.ifsp.classify.security.UserRole;
import br.com.ifsp.classify.specifications.EmployeeSpecification;
import br.com.ifsp.classify.specifications.UserSpecification;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;

@Service
public class UserService extends AbstractService<User, UserCreateDTO, UserGetDTO, UserUpdateDTO, UserFilterDTO, Long> {

    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeRepository employeeRepository;
    private final AuditService auditService;

    public UserService(UserRepository repository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, EmployeeRepository employeeRepository, AuditService auditService) {
        super(repository);
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.employeeRepository = employeeRepository;
        this.auditService = auditService;
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
            throw new DtoException(ExceptionCode.MISSING_FIELD, "É necessário informar o e-mail do usuário.");

        if (Utils.isNullOrEmpty(userDTO.password()))
            throw new DtoException(ExceptionCode.MISSING_FIELD, "É necessário informar a senha do usuário.");

        Role role;
        if (Utils.isNullOrEmpty(userDTO.roleId())) {
            throw new DtoException(ExceptionCode.MISSING_FIELD, "É necessário informar o cargo do usuário.");
        }
        else {
            role = roleRepository
                .findById(userDTO.roleId())
                .orElse(null);

            if (role == null)
                throw new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "O cargo informado não existe.");
        }
        validateRole(role);

        Employee employee;
        if (Utils.isNullOrEmpty(userDTO.employeeUuid())) {
            throw new DtoException(ExceptionCode.MISSING_FIELD, "É necessário informar um funcionário.");
        }
        else {
            employee = employeeRepository
                .findOne(EmployeeSpecification.getByUUID(userDTO.employeeUuid()))
                .orElse(null);
            
            if (employee == null)
                throw new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "O funcionário informado não existe.");
        }

        User newUser = new User();
        newUser.setUuid(UuidUtils.generateUUID());
        newUser.setEmail(Utils.trimAndUpper(userDTO.email()));
        newUser.setPassword(passwordEncoder.encode(userDTO.password()));
        newUser.setRole(role);
        newUser.setCreatedAt(LocalDateTime.now());
        employee.setUser(newUser);

        repository.save(newUser);
        UserGetDTO createdUser = returnDTO(newUser);
        auditService.logInsert("USER", newUser.getId(), createdUser);

        return createdUser;
    }

    public User createUserFromEmployee(UserCreateDTO userDTO) {
        if (userDTO == null)
            return null;

        if (Utils.isNullOrEmpty(userDTO.email()))
            throw new DtoException(ExceptionCode.MISSING_FIELD, "É necessário informar o e-mail do usuário.");

        Role role;
        if (Utils.isNullOrEmpty(userDTO.roleId())) {
            throw new DtoException(ExceptionCode.MISSING_FIELD, "É necessário informar o cargo do usuário.");
        }
        else {
            role = roleRepository
                .findById(userDTO.roleId())
                .orElse(null);

            if (role == null)
                throw new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "O cargo informado não existe.");
        }

        validateRole(role);

        User newUser = new User();
        newUser.setUuid(UuidUtils.generateUUID());
        newUser.setEmail(Utils.trimAndUpper(userDTO.email()));
        newUser.setPassword(initialPassword(userDTO.password()));
        newUser.setRole(role);
        newUser.setCreatedAt(LocalDateTime.now());

        return newUser;
    }

    public CurrentUserGetDTO getCurrentUser(String email) {
        User user = repository.findOne(UserSpecification.getByEmail(email))
                .orElseThrow(() -> new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "Usuário não encontrado."));

        String name = employeeRepository.findByUserEmailAndIsDeletedFalse(email)
                .map(Employee::getName)
                .orElse(null);

        RoleGetDTO role = user.getRole() != null
                ? new RoleGetDTO(user.getRole().getId(), user.getRole().getDescription())
                : null;

        return new CurrentUserGetDTO(name, user.getEmail(), role);
    }

    public void changePassword(String email, PasswordUpdateDTO passwordDTO) {
        if (passwordDTO == null || Utils.isNullOrEmpty(passwordDTO.currentPassword()) || Utils.isNullOrEmpty(passwordDTO.newPassword()))
            throw new DtoException(ExceptionCode.MISSING_FIELD, "É necessário informar a senha atual e a nova senha.");

        User user = repository.findOne(UserSpecification.getByEmail(email))
                .orElseThrow(() -> new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "Usuário não encontrado."));

        if (!passwordEncoder.matches(passwordDTO.currentPassword(), user.getPassword()))
            throw new DtoException(ExceptionCode.INVALID_CREDENTIALS, "A senha atual está incorreta.");

        String newPassword = passwordDTO.newPassword();
        validatePasswordRules(newPassword);

        if (passwordEncoder.matches(newPassword, user.getPassword()))
            throw new DtoException(ExceptionCode.VALIDATION_ERROR, "A nova senha deve ser diferente da senha atual.");

        user.setPassword(passwordEncoder.encode(newPassword));
        repository.save(user);
    }

    public User defineFirstAccessPassword(String email, String password, String confirmPassword) {
        if (Utils.isNullOrEmpty(email))
            throw new DtoException(ExceptionCode.MISSING_FIELD, "Informe o e-mail cadastrado.");

        if (Utils.isNullOrEmpty(password) || Utils.isNullOrEmpty(confirmPassword))
            throw new DtoException(ExceptionCode.MISSING_FIELD, "Informe a senha e a confirmação.");

        User user = repository.findOne(UserSpecification.getByEmail(Utils.trimAndUpper(email))).orElse(null);
        if (user == null)
            throw new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "Não encontramos um cadastro com esse e-mail.");

        if (user.hasPassword())
            throw new DtoException(ExceptionCode.VALIDATION_ERROR,
                    "Esse cadastro já tem senha. Entre pela tela de login.");

        return applyNewPassword(user, password, confirmPassword);
    }

    public User applyNewPassword(User user, String password, String confirmPassword) {
        if (Utils.isNullOrEmpty(password) || Utils.isNullOrEmpty(confirmPassword))
            throw new DtoException(ExceptionCode.MISSING_FIELD, "Informe a senha e a confirmação.");

        validatePasswordRules(password);

        if (!password.equals(confirmPassword))
            throw new DtoException(ExceptionCode.VALIDATION_ERROR, "As senhas não coincidem.");

        user.setPassword(passwordEncoder.encode(password));
        return repository.save(user);
    }

    private void validatePasswordRules(String password) {
        if (password.length() < 8 || !password.matches(".*[a-z].*")
                || !password.matches(".*[A-Z].*") || !password.matches(".*\\d.*"))
            throw new DtoException(ExceptionCode.VALIDATION_ERROR,
                    "A senha deve ter ao menos 8 caracteres, com letra maiúscula, letra minúscula e número.");
    }

    private String initialPassword(String password) {
        return Utils.isNullOrEmpty(password) ? User.NO_PASSWORD : passwordEncoder.encode(password);
    }

    public User createUserForStudent(StudentAccountCreateDTO accountDTO) {
        if (Utils.isNullOrEmpty(accountDTO.email()))
            throw new DtoException(ExceptionCode.MISSING_FIELD, "É necessário informar o e-mail de acesso do aluno.");

        Role role = roleRepository
                .findById(UserRole.ESTUDANTE.name())
                .orElseThrow(() -> new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "O cargo ESTUDANTE não existe."));

        User newUser = new User();
        newUser.setUuid(UuidUtils.generateUUID());
        newUser.setEmail(Utils.trimAndUpper(accountDTO.email()));
        newUser.setPassword(initialPassword(accountDTO.password()));
        newUser.setRole(role);
        newUser.setCreatedAt(LocalDateTime.now());

        return newUser;
    }

    @Override
    public UserGetDTO update(String userUuid, UserUpdateDTO userDTO) {
        User user = getEntityById(userUuid);
        if (user == null || userDTO == null)
            return null;

        UserGetDTO oldUser = returnDTO(user);

        if (!Utils.isNullOrEmpty(userDTO.email()))
            user.setEmail(Utils.trimAndUpper(userDTO.email()));

        if (!Utils.isNullOrEmpty(userDTO.roleId())) {
            Role role = roleRepository
                .findById(userDTO.roleId())
                .orElse(null);

            if (role == null)
                throw new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "O cargo informado não existe.");

            validateRole(role);

            user.setRole(role);
        }

        repository.save(user);
        UserGetDTO updatedUser = returnDTO(user);
        auditService.logUpdate("USER", user.getId(), oldUser, updatedUser);

        return updatedUser;
    }

    public User updateUser(String userUuid, UserUpdateDTO userDTO) {
        User user = getEntityById(userUuid);
        if (user == null || userDTO == null)
            return null;

        UserGetDTO oldUser = returnDTO(user);

        if (!Utils.isNullOrEmpty(userDTO.email()))
            user.setEmail(Utils.trimAndUpper(userDTO.email()));

        if (!Utils.isNullOrEmpty(userDTO.roleId())) {
            Role role = roleRepository
                .findById(userDTO.roleId())
                .orElse(null);

            if (role == null)
                throw new DtoException(ExceptionCode.RESOURCE_NOT_FOUND, "O cargo informado não existe.");

            validateRole(role);

            user.setRole(role);
        }

        UserGetDTO updatedUser = returnDTO(user);
        if (user.getId() != null) {
            auditService.logUpdate("USER", user.getId(), oldUser, updatedUser);
        }

        return user;
    }

    @Override
    public Specification<User> createSpecificationFromFilter(UserFilterDTO filterDTO) {
        Specification<User> conditions = Specification.unrestricted();

        if (filterDTO == null)
            return conditions;

        return conditions;
    }

    private void validateRole(Role role) {
        if (UserRole.fromId(role.getId()).isEmpty())
            throw new DtoException(ExceptionCode.INVALID_ROLE, "O identificador do cargo deve ser ADMIN, PROFESSOR ou ESTUDANTE.");

        if (UserRole.ESTUDANTE.name().equals(role.getId()))
            throw new DtoException(ExceptionCode.INVALID_ROLE, "O cargo ESTUDANTE deve ser vinculado a um cadastro de aluno.");
    }

    @Override
    public ResponseEntity<Void> delete(String uuid) {
        User user = getEntityById(uuid);
        if (user == null)
            return ResponseEntity.badRequest().build();

        UserGetDTO oldUser = returnDTO(user);
        Long id = user.getId();
        repository.delete(user);
        auditService.logDelete("USER", id, oldUser);

        return ResponseEntity.noContent().build();
    }
}