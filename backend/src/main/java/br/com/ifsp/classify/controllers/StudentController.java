package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.GuardianCreateDTO;
import br.com.ifsp.classify.dtos.create.StudentCreateDTO;
import br.com.ifsp.classify.dtos.get.GuardianGetDTO;
import br.com.ifsp.classify.dtos.get.StudentGetDTO;
import br.com.ifsp.classify.dtos.update.GuardianUpdateDTO;
import br.com.ifsp.classify.dtos.update.StudentUpdateDTO;
import br.com.ifsp.classify.services.StudentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/student", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
public class StudentController extends AbstractController<StudentCreateDTO, StudentGetDTO, StudentUpdateDTO> {

    private final StudentService service;

    public StudentController(StudentService service) {
        super(service);
        this.service = service;
    }

    @PostMapping("/{uuid}/guardians")
    public ResponseEntity<List<GuardianGetDTO>> addGuardians( @PathVariable String uuid, @RequestBody List<GuardianCreateDTO> guardiansDTO ) {
        List<GuardianGetDTO> guardians = service.addGuardians(uuid, guardiansDTO);

        return (guardians != null && !guardians.isEmpty())
                ? ResponseEntity.status(HttpStatus.CREATED).body(guardians)
                : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    @PutMapping("/{uuid}/guardians/{guardianUuid}")
    public ResponseEntity<GuardianGetDTO> updateGuardian(@PathVariable String uuid, @PathVariable String guardianUuid, @RequestBody GuardianUpdateDTO guardianDTO ) {
        GuardianGetDTO guardian = service.updateGuardian(uuid, guardianUuid, guardianDTO);

        return (guardian != null)
                ? ResponseEntity.ok(guardian)
                : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}