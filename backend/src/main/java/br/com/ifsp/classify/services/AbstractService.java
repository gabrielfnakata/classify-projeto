package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.get.PageResponseGetDTO;
import br.com.ifsp.classify.repositories.AbstractRepository;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;

public abstract class AbstractService<Model, CreateDTO, GetDTO, UpdateDTO, FilterDTO, ID> implements InterfaceService<CreateDTO, GetDTO, UpdateDTO, FilterDTO> {

    protected final AbstractRepository<Model, ID> repository;
    private final String uuid = "uuid";

    public AbstractService(AbstractRepository<Model, ID> repository) {
        this.repository = repository;
    }

    abstract GetDTO returnDTO(Model entity);
    public abstract GetDTO create(CreateDTO entity);
    public abstract GetDTO update(String uuid, UpdateDTO entity);
    public abstract Specification<Model> createSpecificationFromFilter(FilterDTO filterDTO);

    @Override
    public PageResponseGetDTO<GetDTO> findAll(Pageable pageable, FilterDTO filterDTO) {
        Page<GetDTO> pageResponse = repository
            .findAll(createSpecificationFromFilter(filterDTO), pageable)
            .map(this::returnDTO);

        return returnPageResponseDTO(pageResponse);
    }

    @Override
    public GetDTO getById(String uuid) {
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

    private PageResponseGetDTO<GetDTO> returnPageResponseDTO(Page<GetDTO> pageable) {
        return (pageable == null)
            ? null
            : PageResponseGetDTO.from(pageable);
    }
}