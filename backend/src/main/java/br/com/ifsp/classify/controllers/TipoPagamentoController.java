package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.TipoPagamentoDTO;
import br.com.ifsp.classify.services.TipoPagamentoService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/tipopagamento", produces = "application/json")
public class TipoPagamentoController extends BaseController<TipoPagamentoDTO, Integer> {

    public TipoPagamentoController(TipoPagamentoService service) {
        super(service);
    }
}