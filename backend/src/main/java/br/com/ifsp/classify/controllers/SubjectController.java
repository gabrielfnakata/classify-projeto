package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.DisciplinaDTO;
import br.com.ifsp.classify.services.DisciplinaService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/subject", produces = "application/json")
public class SubjectController extends AbstractController<DisciplinaDTO, Integer> {

    public SubjectController(DisciplinaService service) {
        super(service);
    }
}