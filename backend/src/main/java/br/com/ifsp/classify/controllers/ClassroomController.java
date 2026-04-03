package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.ClassroomCreateDTO;
import br.com.ifsp.classify.dtos.get.ClassroomGetDTO;
import br.com.ifsp.classify.dtos.update.ClassroomUpdateDTO;
import br.com.ifsp.classify.services.ClassroomService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/classroom", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
public class ClassroomController extends AbstractController<ClassroomCreateDTO, ClassroomGetDTO, ClassroomUpdateDTO> {

    public ClassroomController(ClassroomService service) {
        super(service);
    }
}