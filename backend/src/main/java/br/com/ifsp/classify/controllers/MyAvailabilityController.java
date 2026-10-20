package br.com.ifsp.classify.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.ifsp.classify.dtos.create.TeacherAvailabilityCreateDTO;
import br.com.ifsp.classify.dtos.get.TeacherAvailabilityGetDTO;
import br.com.ifsp.classify.security.AuthenticatedUser;
import br.com.ifsp.classify.services.EmployeeService;
import br.com.ifsp.classify.services.TeacherAvailabilityService;

@RestController
@RequestMapping(value = "/employee/me/availability", produces = MediaType.APPLICATION_JSON_VALUE)
public class MyAvailabilityController {

    private final EmployeeService employeeService;
    private final TeacherAvailabilityService availabilityService;

    public MyAvailabilityController(EmployeeService employeeService, TeacherAvailabilityService availabilityService) {
        this.employeeService = employeeService;
        this.availabilityService = availabilityService;
    }

    @GetMapping
    public ResponseEntity<List<TeacherAvailabilityGetDTO>> list(Authentication authentication) {
        List<TeacherAvailabilityGetDTO> blocks = availabilityService.listByEmployee(employeeUuid(authentication));

        return blocks.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(blocks);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<TeacherAvailabilityGetDTO>> add(Authentication authentication,
                                                               @RequestBody TeacherAvailabilityCreateDTO body) {
        List<TeacherAvailabilityGetDTO> blocks = availabilityService.add(employeeUuid(authentication), body);

        return (blocks == null)
                ? ResponseEntity.badRequest().build()
                : ResponseEntity.status(HttpStatus.CREATED).body(blocks);
    }

    @DeleteMapping("/{availabilityUuid}")
    public ResponseEntity<List<TeacherAvailabilityGetDTO>> remove(Authentication authentication,
                                                                  @PathVariable String availabilityUuid) {
        return ResponseEntity.ok(availabilityService.remove(employeeUuid(authentication), availabilityUuid));
    }

    private String employeeUuid(Authentication authentication) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        return employeeService.getProfile(user.username()).uuid();
    }
}
