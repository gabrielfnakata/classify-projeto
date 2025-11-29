package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.AlunoDTO;
import br.com.ifsp.classify.services.AlunoService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/aluno", produces = "application/json")
public class AlunoController extends BaseController<AlunoDTO, Long> {

    public AlunoController(AlunoService service) {
        super(service);
    }
}