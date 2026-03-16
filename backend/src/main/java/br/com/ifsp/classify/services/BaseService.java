package br.com.ifsp.classify.services;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.stream.Collectors;

public abstract class BaseService<E, DTO, ID> implements InterfaceService<DTO, ID> {

    protected final JpaRepository<E, ID> repository;

    public BaseService(JpaRepository<E, ID> repository) {
        this.repository = repository;
    }

    abstract DTO returnDTO(E entity);
    public abstract DTO create(DTO entity);
    public abstract DTO update(ID id, DTO entity);

    @Override
    public List<DTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::returnDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DTO findById(ID id) {
        return returnDTO(getEntityById(id));
    }

    @Override
    public ResponseEntity<Void> delete(ID id) {
        E entity = getEntityById(id);
        if (entity == null)
            return ResponseEntity.badRequest().build();

        repository.delete(entity);
        return ResponseEntity.noContent().build();
    }

    protected E getEntityById(ID id) {
        return (id == null)
                ? null
                : repository.findById(id).orElse(null);
    }
}