package br.com.ifsp.classify.services;

import br.com.ifsp.classify.models.Class;
import br.com.ifsp.classify.models.ClassSession;
import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.models.Student;
import br.com.ifsp.classify.models.User;
import br.com.ifsp.classify.repositories.ClassSessionRepository;
import br.com.ifsp.classify.repositories.UserRepository;
import br.com.ifsp.classify.security.AuthenticatedUser;
import br.com.ifsp.classify.security.UserRole;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Collectors;

/**
 * Quem está logado e o que essa pessoa pode alcançar.
 * Admin vê tudo; professor só o que tem vínculo com ele (aulas dele, as turmas dessas aulas e
 * os alunos delas); aluno só o que é dele. Sem usuário autenticado (rotinas de inicialização),
 * nada é restringido.
 */
@Service
public class AccessScopeService {

    private final UserRepository userRepository;
    private final ClassSessionRepository classSessionRepository;

    public AccessScopeService(UserRepository userRepository, ClassSessionRepository classSessionRepository) {
        this.userRepository = userRepository;
        this.classSessionRepository = classSessionRepository;
    }

    private Optional<AuthenticatedUser> current() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser user)
            return Optional.of(user);
        return Optional.empty();
    }

    private boolean hasRole(UserRole role) {
        return current().map(user -> role.name().equals(user.role())).orElse(false);
    }

    public boolean isProfessor() {
        return hasRole(UserRole.PROFESSOR);
    }

    public boolean isStudent() {
        return hasRole(UserRole.ESTUDANTE);
    }

    /** Admin ou rotina interna: sem restrição. */
    public boolean isUnrestricted() {
        return current().isEmpty() || hasRole(UserRole.ADMIN);
    }

    private User currentUser() {
        return current()
                .flatMap(user -> userRepository.findByEmail(user.username()))
                .orElseThrow(() -> new AccessDeniedException("Usuário não encontrado."));
    }

    public Employee currentEmployee() {
        Employee employee = currentUser().getEmployee();
        if (employee == null)
            throw new AccessDeniedException("Seu usuário não está vinculado a um funcionário.");
        return employee;
    }

    public Student currentStudent() {
        Student student = currentUser().getStudent();
        if (student == null)
            throw new AccessDeniedException("Seu usuário não está vinculado a um aluno.");
        return student;
    }

    public static Specification<ClassSession> taughtBy(Long employeeId) {
        return (root, query, cb) -> cb.equal(root.get("subjectTeacher").get("employee").get("id"), employeeId);
    }

    // Vínculos do professor

    public List<ClassSession> sessionsOf(Employee employee) {
        return classSessionRepository.findAll(taughtBy(employee.getId()));
    }

    public Set<Long> linkedClassIds(Employee employee) {
        Set<Long> ids = new HashSet<>();
        sessionsOf(employee).forEach(session -> {
            if (session.getClassSessionClass() != null)
                ids.add(session.getClassSessionClass().getId());
        });
        return ids;
    }

    public Set<Long> linkedStudentIds(Employee employee) {
        Set<Long> ids = new HashSet<>();
        sessionsOf(employee).forEach(session -> {
            if (session.getStudent() != null)
                ids.add(session.getStudent().getId());
            if (session.getClassSessionClass() != null)
                session.getClassSessionClass().getStudents().forEach(student -> ids.add(student.getId()));
        });
        return ids;
    }

    // Verificações de acesso a um registro específico

    public boolean ownsSession(ClassSession session) {
        if (isUnrestricted())
            return true;
        if (isProfessor())
            return Objects.equals(session.getSubjectTeacher().getEmployee().getId(), currentEmployee().getId());
        if (isStudent())
            return session.getStudent() != null && Objects.equals(session.getStudent().getId(), currentStudent().getId());
        return false;
    }

    public void requireOwnsSession(ClassSession session) {
        if (!ownsSession(session))
            throw new AccessDeniedException("Você só pode alterar as suas próprias aulas.");
    }

    /**
     * Quais aulas o usuário pode ler: o professor, as dele; o aluno, as individuais dele e as das
     * turmas dele. Resolve o usuário uma vez só, para filtrar listas sem uma consulta por aula.
     */
    public Predicate<ClassSession> sessionVisibility() {
        if (isUnrestricted())
            return session -> true;

        if (isProfessor()) {
            Long employeeId = currentEmployee().getId();
            return session -> Objects.equals(session.getSubjectTeacher().getEmployee().getId(), employeeId);
        }

        if (isStudent()) {
            Student student = currentStudent();
            Set<Long> classIds = student.getClasses().stream().map(Class::getId).collect(Collectors.toSet());
            return session -> (session.getStudent() != null && Objects.equals(session.getStudent().getId(), student.getId()))
                    || (session.getClassSessionClass() != null && classIds.contains(session.getClassSessionClass().getId()));
        }

        return session -> false;
    }

    public void requireCanViewSession(ClassSession session) {
        if (!sessionVisibility().test(session))
            throw new AccessDeniedException("Você não tem acesso a essa aula.");
    }

    public void requireCanViewStudent(Student student) {
        if (isUnrestricted())
            return;
        boolean allowed = isProfessor()
                ? linkedStudentIds(currentEmployee()).contains(student.getId())
                : isStudent() && Objects.equals(currentStudent().getId(), student.getId());
        if (!allowed)
            throw new AccessDeniedException("Você não tem acesso a esse aluno.");
    }

    public void requireCanViewClass(Class classModel) {
        if (isUnrestricted())
            return;
        if (!isProfessor() || !linkedClassIds(currentEmployee()).contains(classModel.getId()))
            throw new AccessDeniedException("Você não tem acesso a essa turma.");
    }
}
