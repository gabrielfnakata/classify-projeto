package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.AulaDTO;
import br.com.ifsp.classify.services.AulaService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/aula", produces = "application/json")
public class AulaController extends BaseController<AulaDTO, Long> {

    public AulaController(AulaService service) {
        super(service);
    }
}