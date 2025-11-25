package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.DisciplinaDTO;
import br.com.ifsp.classify.services.DisciplinaService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/disciplina", produces = "application/json")
public class DisciplinaController extends BaseController<DisciplinaDTO, Integer> {

    public DisciplinaController(DisciplinaService service) {
        super(service);
    }
}