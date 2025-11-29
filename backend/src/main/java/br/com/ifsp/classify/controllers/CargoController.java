package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.CargoDTO;
import br.com.ifsp.classify.services.CargoService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/cargo", produces = "application/json")
public class CargoController extends BaseController<CargoDTO, Integer> {

    public CargoController(CargoService service) {
        super(service);
    }
}