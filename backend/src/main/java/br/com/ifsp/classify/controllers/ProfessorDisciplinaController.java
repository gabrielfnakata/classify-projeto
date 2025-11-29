package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.ProfessorDisciplinaDTO;
import br.com.ifsp.classify.services.ProfessorDisciplinaService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/professordisciplina", produces = "application/json")
public class ProfessorDisciplinaController extends BaseController<ProfessorDisciplinaDTO, Long> {

    public ProfessorDisciplinaController(ProfessorDisciplinaService service) {
        super(service);
    }
}