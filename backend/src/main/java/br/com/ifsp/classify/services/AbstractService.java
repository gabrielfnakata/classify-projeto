package br.com.ifsp.classify.services;

import br.com.ifsp.classify.repositories.AbstractRepository;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.stream.Collectors;

public abstract class AbstractService<Model, CreateDTO, GetDTO, UpdateDTO, ID> implements InterfaceService<CreateDTO, GetDTO, UpdateDTO> {

    protected final AbstractRepository<Model, ID> repository;
    private final String uuid = "uuid";

    public AbstractService(AbstractRepository<Model, ID> repository) {
        this.repository = repository;
    }

    abstract GetDTO returnDTO(Model entity);
    public abstract GetDTO create(CreateDTO entity);
    public abstract GetDTO update(String uuid, UpdateDTO entity);

    @Override
    public List<GetDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::returnDTO)
                .collect(Collectors.toList());
    }

    @Override
    public GetDTO findById(String uuid) {
        return Utils.isNullOrEmpty(uuid)
                ? null
                : returnDTO(getEntityById(uuid));
    }

    @Override
    public ResponseEntity<Void> delete(String uuid) {
        Model entity = getEntityById(uuid);
        if (entity == null)
            return ResponseEntity.badRequest().build();

        repository.delete(entity);
        return ResponseEntity.noContent().build();
    }

    protected Model getEntityById(String uuid) {
        Specification<Model> spec = (root, query, cb) ->
                cb.equal(root.get(this.uuid), UuidUtils.convertUUIDToBytes(uuid));

        return repository.findOne(spec).orElse(null);
    }
}