package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.SalaDTO;
import br.com.ifsp.classify.services.SalaService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/sala", produces = "application/json")
public class SalaController extends BaseController<SalaDTO, Integer> {

    public SalaController(SalaService service) {
        super(service);
    }
}