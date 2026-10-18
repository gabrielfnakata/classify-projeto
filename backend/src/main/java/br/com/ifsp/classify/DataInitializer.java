package br.com.ifsp.classify;

import java.time.LocalDate;
import java.time.Month;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import br.com.ifsp.classify.dtos.create.EmployeeCreateDTO;
import br.com.ifsp.classify.dtos.create.SubjectCreateDTO;
import br.com.ifsp.classify.dtos.create.SubjectTeacherCreateDTO;
import br.com.ifsp.classify.dtos.create.RoleCreateDTO;
import br.com.ifsp.classify.dtos.create.UserCreateDTO;
import br.com.ifsp.classify.dtos.get.EmployeeGetDTO;
import br.com.ifsp.classify.dtos.get.RoleGetDTO;
import br.com.ifsp.classify.dtos.get.SubjectGetDTO;
import br.com.ifsp.classify.repositories.RoleRepository;
import br.com.ifsp.classify.repositories.UserRepository;
import br.com.ifsp.classify.services.EmployeeService;
import br.com.ifsp.classify.services.RoleService;
import br.com.ifsp.classify.services.SubjectService;
import br.com.ifsp.classify.services.SubjectTeacherService;
import br.com.ifsp.classify.services.UserService;
import br.com.ifsp.classify.security.UserRole;

@Configuration
public class DataInitializer {
    
    @Bean
    CommandLineRunner initDatabase(RoleRepository roleRepository, RoleService roleService, EmployeeService employeeService, UserRepository userRepository, UserService userService, SubjectService subjectService, SubjectTeacherService subjectTeacherService) {
        return (args) -> {
            for (UserRole role : UserRole.values()) {
                String roleName = role.name();
                
                if (roleName != null && roleRepository.findById(roleName).isEmpty()) {
                    roleService.create(new RoleCreateDTO(role.name(), role.name()));
                }
            }

            if (userRepository.count() == 0) {
                RoleGetDTO adminRole = roleService.getById(UserRole.ADMIN.name());
                RoleGetDTO profRole = roleService.getById(UserRole.PROFESSOR.name());
                if (adminRole == null || profRole == null)
                    return;

                employeeService.create(new EmployeeCreateDTO(
                    "ADMINISTRADOR",
                    LocalDate.of(2000, Month.JANUARY, 01),
                    "467.330.035-11",
                    LocalDate.now(),
                    new UserCreateDTO(
                        "admin@gmail.com",
                        "123456aA",
                        adminRole.id(),
                        null
                    ),
                    null
                ));
                
                EmployeeGetDTO teacherEmployee = employeeService.create(new EmployeeCreateDTO(
                    "GLAUCO",
                    LocalDate.of(2000, Month.JANUARY, 01),
                    "417.116.320-07",
                    LocalDate.now(),
                    new UserCreateDTO(
                        "glauco@gmail.com",
                        "123456aA",
                        profRole.id(),
                        null
                    ),
                    null
                ));
                SubjectGetDTO mathSubject = subjectService.create(new SubjectCreateDTO("Matemática"));
                subjectTeacherService.create(new SubjectTeacherCreateDTO(teacherEmployee.uuid(), mathSubject.uuid()));
            }
        };
    }
}
