package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.create.RoleCreateDTO;
import br.com.ifsp.classify.dtos.get.RoleGetDTO;
import br.com.ifsp.classify.dtos.update.RoleUpdateDTO;
import br.com.ifsp.classify.services.RoleService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/role", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
public class RoleController extends AbstractController<RoleCreateDTO, RoleGetDTO, RoleUpdateDTO> {

    public RoleController(RoleService service) {
        super(service);
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<RoleGetDTO> findById( @PathVariable String id ) {
        RoleGetDTO role = service.getById(id);

        return (role != null)
                ? ResponseEntity.ok(role)
                : ResponseEntity.badRequest().build();
    }
}