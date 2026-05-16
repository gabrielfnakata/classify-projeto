package br.com.ifsp.classify;

import java.time.LocalDate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import br.com.ifsp.classify.dtos.create.EmployeeCreateDTO;
import br.com.ifsp.classify.dtos.create.RoleCreateDTO;
import br.com.ifsp.classify.models.Role;
import br.com.ifsp.classify.repositories.EmployeeRepository;
import br.com.ifsp.classify.repositories.RoleRepository;
import br.com.ifsp.classify.services.EmployeeService;
import br.com.ifsp.classify.services.RoleService;
import br.com.ifsp.classify.utils.UuidUtils;

@Configuration
public class DataInitializer {
    
    @Bean
    CommandLineRunner initDatabase(RoleRepository roleRepository, RoleService roleService, EmployeeRepository empRepository, EmployeeService empService) {
        return (args) -> {
            if (roleRepository.count() == 0) {
                roleService.create(new RoleCreateDTO("ADMIN"));
                roleService.create(new RoleCreateDTO("SECRETARY"));
                roleService.create(new RoleCreateDTO("TEACHER"));
            }

            if (empRepository.count() == 0) {
                Role adminRole = roleService.getByDescription("ADMIN");
                if (adminRole == null)
                    return;
                
                EmployeeCreateDTO newEmp = new EmployeeCreateDTO(
                    "ADMIN",
                    "123456aA",
                    "11111111111",
                    LocalDate.now(),
                    "admin@gmail.com",
                    "11912345678",
                    "Rua das Flores, 199 - São Paulo",
                    UuidUtils.convertBytesToString(adminRole.getUuid())
                );

                empService.create(newEmp);
            }
        };
    }
}
