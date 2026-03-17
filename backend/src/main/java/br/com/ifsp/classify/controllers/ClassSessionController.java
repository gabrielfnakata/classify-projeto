package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.AulaDTO;
import br.com.ifsp.classify.services.AulaService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/classsession", produces = "application/json")
public class ClassSessionController extends AbstractController<AulaDTO, Long> {

    public ClassSessionController(AulaService service) {
        super(service);
    }
}