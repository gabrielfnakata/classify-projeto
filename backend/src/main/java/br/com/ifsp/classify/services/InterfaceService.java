package br.com.ifsp.classify.services;

import org.springframework.http.ResponseEntity;

import java.util.List;

public interface BaseService<T, ID> {
    List<T> findAll();
    T findById(ID id);
    T create(T entity);
    T update(ID id, T entity);
    ResponseEntity<Void> delete(ID id);
}