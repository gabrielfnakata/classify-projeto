package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.CargoDTO;
import br.com.ifsp.classify.services.CargoService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/role", produces = "application/json")
public class RoleController extends AbstractController<CargoDTO, Integer> {

    public RoleController(CargoService service) {
        super(service);
    }
}