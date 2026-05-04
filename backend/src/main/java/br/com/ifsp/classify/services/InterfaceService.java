package br.com.ifsp.classify.services;

import org.springframework.http.ResponseEntity;

import java.util.List;

public interface InterfaceService<CreateDTO, GetDTO, UpdateDTO> {
    List<GetDTO> findAll();
    GetDTO findById(String uuid);
    GetDTO create(CreateDTO entity);
    GetDTO update(String uuid, UpdateDTO entity);
    ResponseEntity<Void> delete(String uuid);
}