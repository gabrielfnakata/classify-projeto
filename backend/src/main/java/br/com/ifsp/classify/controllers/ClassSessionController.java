package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.ClassSessionCreateDTO;
import br.com.ifsp.classify.dtos.get.ClassSessionGetDTO;
import br.com.ifsp.classify.dtos.update.ClassSessionStatusUpdateDTO;
import br.com.ifsp.classify.dtos.update.ClassSessionUpdateDTO;
import br.com.ifsp.classify.services.ClassSessionService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/classsession", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
public class ClassSessionController extends AbstractController<ClassSessionCreateDTO, ClassSessionGetDTO, ClassSessionUpdateDTO> {

    private final ClassSessionService service;

    public ClassSessionController(ClassSessionService service) {
        super(service);
        this.service = service;
    }

    @PutMapping("/{uuid}/status")
    public ResponseEntity<ClassSessionGetDTO> changeStatus(
            @PathVariable String uuid, @RequestBody ClassSessionStatusUpdateDTO body) {
        ClassSessionGetDTO session = service.changeStatus(uuid, body);

        return (session == null)
                ? ResponseEntity.badRequest().build()
                : ResponseEntity.ok(session);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<ClassSessionGetDTO>> filter(
            @RequestParam(required = false) String studentUuid,
            @RequestParam(required = false) String employeeUuid,
            @RequestParam(required = false) String classroomUuid,
            @RequestParam(required = false) String subjectUuid,
            @RequestParam(required = false) String classUuid) {
        List<ClassSessionGetDTO> sessions = service.filter(studentUuid, employeeUuid, classroomUuid, subjectUuid, classUuid);

        return sessions.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(sessions);
    }
}