package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.RoleCreateDTO;
import br.com.ifsp.classify.dtos.get.RoleGetDTO;
import br.com.ifsp.classify.dtos.update.RoleUpdateDTO;
import br.com.ifsp.classify.services.RoleService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/role", produces = "application/json")
public class RoleController extends AbstractController<RoleCreateDTO, RoleGetDTO, RoleUpdateDTO> {

    public RoleController(RoleService service) {
        super(service);
    }
}