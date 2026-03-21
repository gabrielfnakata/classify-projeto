package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.StudentCreateDTO;
import br.com.ifsp.classify.dtos.get.StudentGetDTO;
import br.com.ifsp.classify.dtos.update.StudentUpdateDTO;
import br.com.ifsp.classify.services.StudentService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping(value = "/student", produces = "application/json")
public class StudentController extends AbstractController<StudentCreateDTO, StudentGetDTO, StudentUpdateDTO> {

    public StudentController(StudentService service) {
        super(service);
    }
}