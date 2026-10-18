package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.AddStudentsToClassDTO;
import br.com.ifsp.classify.dtos.create.ClassCreateDTO;
import br.com.ifsp.classify.dtos.get.ClassGetDTO;
import br.com.ifsp.classify.dtos.get.ClassStudentSummaryDTO;
import br.com.ifsp.classify.dtos.update.ClassUpdateDTO;
import br.com.ifsp.classify.services.ClassService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/class", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
public class ClassController extends AbstractController<ClassCreateDTO, ClassGetDTO, ClassUpdateDTO> {

    private final ClassService service;

    public ClassController(ClassService service) {
        super(service);
        this.service = service;
    }

    @PostMapping("/{uuid}/students")
    public ResponseEntity<List<ClassStudentSummaryDTO>> addStudents(
            @PathVariable String uuid, @RequestBody AddStudentsToClassDTO body) {
        List<ClassStudentSummaryDTO> students = service.addStudents(uuid, body.studentUuids());

        return (students == null)
                ? ResponseEntity.badRequest().build()
                : ResponseEntity.status(HttpStatus.CREATED).body(students);
    }

    @DeleteMapping("/{uuid}/students/{studentUuid}")
    public ResponseEntity<List<ClassStudentSummaryDTO>> removeStudent(
            @PathVariable String uuid, @PathVariable String studentUuid) {
        List<ClassStudentSummaryDTO> students = service.removeStudent(uuid, studentUuid);

        return ResponseEntity.ok(students);
    }
}
