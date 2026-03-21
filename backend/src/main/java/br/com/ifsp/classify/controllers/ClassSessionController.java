package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.ClassSessionCreateDTO;
import br.com.ifsp.classify.dtos.get.ClassSessionGetDTO;
import br.com.ifsp.classify.dtos.update.ClassSessionUpdateDTO;
import br.com.ifsp.classify.services.ClassSessionService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/classsession", produces = "application/json")
public class ClassSessionController extends AbstractController<ClassSessionCreateDTO, ClassSessionGetDTO, ClassSessionUpdateDTO> {

    public ClassSessionController(ClassSessionService service) {
        super(service);
    }
}