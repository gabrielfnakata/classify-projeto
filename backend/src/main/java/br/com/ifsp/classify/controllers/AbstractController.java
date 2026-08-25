package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.dtos.get.PageResponseGetDTO;
import br.com.ifsp.classify.services.InterfaceService;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

public abstract class AbstractController<CreateDTO, GetDTO, UpdateDTO, FilterDTO> {

    protected final InterfaceService<CreateDTO, GetDTO, UpdateDTO, FilterDTO> service;

    protected AbstractController(InterfaceService<CreateDTO, GetDTO, UpdateDTO, FilterDTO> service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<PageResponseGetDTO<GetDTO>> findAll( @PageableDefault(size = 10, sort = "id") Pageable pageable, FilterDTO filterDTO ) {
        PageResponseGetDTO<GetDTO> responseDTO = service.findAll(pageable, filterDTO);

        return (responseDTO.content().isEmpty())
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<GetDTO> findById( @PathVariable String uuid ) {
        GetDTO entity = service.getById(uuid);

        return (entity != null)
                ? ResponseEntity.ok(entity)
                : ResponseEntity.badRequest().build();
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<GetDTO> create( @RequestBody CreateDTO entity ) {
        GetDTO newEntity = service.create(entity);

        return (newEntity == null)
                ? ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
                : ResponseEntity.status(HttpStatus.CREATED).body(newEntity);
    }

    @PutMapping(value = "/{uuid}", consumes = "application/json")
    public ResponseEntity<GetDTO> update( @PathVariable String uuid,
                                     @RequestBody UpdateDTO entity) {
        GetDTO updatedEntity = service.update(uuid, entity);

        return (updatedEntity != null)
                ? ResponseEntity.ok(updatedEntity)
                : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete( @PathVariable String id ) {
        return service.delete(id);
    }
}