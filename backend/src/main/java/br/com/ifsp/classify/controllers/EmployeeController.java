package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.FuncionarioDTO;
import br.com.ifsp.classify.services.FuncionarioService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/employee", produces = "application/json")
public class EmployeeController extends AbstractController<FuncionarioDTO, Long> {

    public EmployeeController(FuncionarioService service) {
        super(service);
    }
}