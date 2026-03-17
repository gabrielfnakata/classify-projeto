package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.ProfessorDisciplinaDTO;
import br.com.ifsp.classify.services.ProfessorDisciplinaService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/subjectteacher", produces = "application/json")
public class SubjectTeacherController extends AbstractController<ProfessorDisciplinaDTO, Long> {

    public SubjectTeacherController(ProfessorDisciplinaService service) {
        super(service);
    }
}