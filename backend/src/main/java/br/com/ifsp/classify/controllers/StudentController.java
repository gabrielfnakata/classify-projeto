package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.AlunoDTO;
import br.com.ifsp.classify.services.AlunoService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/student", produces = "application/json")
public class StudentController extends AbstractController<AlunoDTO, Long> {

    public StudentController(AlunoService service) {
        super(service);
    }
}