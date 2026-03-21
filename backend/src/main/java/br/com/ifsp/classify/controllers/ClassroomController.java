package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.ClassroomCreateDTO;
import br.com.ifsp.classify.services.ClassroomService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/sala", produces = "application/json")
public class SalaController extends AbstractController<ClassroomCreateDTO, Integer> {

    public SalaController(ClassroomService service) {
        super(service);
    }
}