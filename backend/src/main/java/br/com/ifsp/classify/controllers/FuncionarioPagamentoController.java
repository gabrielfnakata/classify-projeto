package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.FuncionarioPagamentoDTO;
import br.com.ifsp.classify.services.FuncionarioPagamentoService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/pagamento", produces = "application/json")
public class FuncionarioPagamentoController extends BaseController<FuncionarioPagamentoDTO, Long> {

    public FuncionarioPagamentoController(FuncionarioPagamentoService service) {
        super(service);
    }
}