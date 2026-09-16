package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.EmployeeCreateDTO;
import br.com.ifsp.classify.dtos.create.TeacherAvailabilityCreateDTO;
import br.com.ifsp.classify.dtos.get.EmployeeGetDTO;
import br.com.ifsp.classify.dtos.get.TeacherAvailabilityGetDTO;
import br.com.ifsp.classify.dtos.update.EmployeeUpdateDTO;
import br.com.ifsp.classify.services.EmployeeService;
import br.com.ifsp.classify.services.TeacherAvailabilityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/employee", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
public class EmployeeController extends AbstractController<EmployeeCreateDTO, EmployeeGetDTO, EmployeeUpdateDTO> {

    private final TeacherAvailabilityService availabilityService;

    public EmployeeController(EmployeeService service, TeacherAvailabilityService availabilityService) {
        super(service);
        this.availabilityService = availabilityService;
    }

    @GetMapping("/{uuid}/availability")
    public ResponseEntity<List<TeacherAvailabilityGetDTO>> listAvailability(@PathVariable String uuid) {
        List<TeacherAvailabilityGetDTO> blocks = availabilityService.listByEmployee(uuid);

        return blocks.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(blocks);
    }

    @PostMapping("/{uuid}/availability")
    public ResponseEntity<List<TeacherAvailabilityGetDTO>> addAvailability(
            @PathVariable String uuid, @RequestBody TeacherAvailabilityCreateDTO body) {
        List<TeacherAvailabilityGetDTO> blocks = availabilityService.add(uuid, body);

        return (blocks == null)
                ? ResponseEntity.badRequest().build()
                : ResponseEntity.status(HttpStatus.CREATED).body(blocks);
    }

    @DeleteMapping("/{uuid}/availability/{availabilityUuid}")
    public ResponseEntity<List<TeacherAvailabilityGetDTO>> removeAvailability(
            @PathVariable String uuid, @PathVariable String availabilityUuid) {
        return ResponseEntity.ok(availabilityService.remove(uuid, availabilityUuid));
    }
}
