package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.FuncionarioDTO;
import br.com.ifsp.classify.services.FuncionarioService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/funcionario", produces = "application/json")
public class FuncionarioController extends BaseController<FuncionarioDTO, Long> {

    public FuncionarioController(FuncionarioService service) {
        super(service);
    }
}