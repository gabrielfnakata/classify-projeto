package br.com.ifsp.classify.services;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import br.com.ifsp.classify.dtos.get.PageResponseGetDTO;

public interface InterfaceService<CreateDTO, GetDTO, UpdateDTO, FilterDTO> {
    PageResponseGetDTO<GetDTO> findAll(Pageable pageable, FilterDTO filterDTO);
    GetDTO getById(String uuid);
    GetDTO create(CreateDTO entity);
    GetDTO update(String uuid, UpdateDTO entity);
    ResponseEntity<Void> delete(String uuid);
}