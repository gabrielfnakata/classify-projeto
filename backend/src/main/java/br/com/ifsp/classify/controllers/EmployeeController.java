package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.EmployeeCreateDTO;
import br.com.ifsp.classify.dtos.get.EmployeeGetDTO;
import br.com.ifsp.classify.dtos.update.EmployeeUpdateDTO;
import br.com.ifsp.classify.services.EmployeeService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/employee", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
public class EmployeeController extends AbstractController<EmployeeCreateDTO, EmployeeGetDTO, EmployeeUpdateDTO> {

    public EmployeeController(EmployeeService service) {
        super(service);
    }
}