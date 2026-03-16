package br.com.ifsp.classify.services;

import org.springframework.http.ResponseEntity;

import java.util.List;

public interface InterfaceService<DTO, ID> {
    List<DTO> findAll();
    DTO findById(ID id);
    DTO create(DTO entity);
    DTO update(ID id, DTO entity);
    ResponseEntity<Void> delete(ID id);
}