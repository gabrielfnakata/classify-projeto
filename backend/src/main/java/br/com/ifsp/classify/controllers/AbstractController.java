package br.com.ifsp.classify.controllers;

import br.com.ifsp.classify.services.InterfaceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

public abstract class AbstractController<T, ID> {

    protected final InterfaceService<T, ID> service;

    protected AbstractController(InterfaceService<T, ID> service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<T>> findAll() {
        List<T> allEntities = service.findAll();

        return (allEntities.isEmpty())
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(allEntities);
    }

    @GetMapping("/{id}")
    public ResponseEntity<T> findById( @PathVariable ID id ) {
        T entity = service.findById(id);

        return (entity != null)
                ? ResponseEntity.ok(entity)
                : ResponseEntity.badRequest().build();
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<T> create( @RequestBody T entity ) {
        T newEntity = service.create(entity);

        return (newEntity == null)
                ? ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
                : ResponseEntity.status(HttpStatus.CREATED).body(newEntity);
    }

    @PutMapping(value = "/{id}", consumes = "application/json")
    public ResponseEntity<T> update( @PathVariable ID id,
                                     @RequestBody T entity) {
        T updatedEntity = service.update(id, entity);

        return (updatedEntity != null)
                ? ResponseEntity.ok(updatedEntity)
                : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete( @PathVariable ID id ) {
        return service.delete(id);
    }
}