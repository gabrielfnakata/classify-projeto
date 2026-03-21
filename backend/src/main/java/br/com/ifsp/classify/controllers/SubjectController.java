package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.SubjectCreateDTO;
import br.com.ifsp.classify.dtos.get.SubjectGetDTO;
import br.com.ifsp.classify.dtos.update.SubjectUpdateDTO;
import br.com.ifsp.classify.services.SubjectService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/subject", produces = "application/json")
public class SubjectController extends AbstractController<SubjectCreateDTO, SubjectGetDTO, SubjectUpdateDTO> {

    public SubjectController(SubjectService service) {
        super(service);
    }
}