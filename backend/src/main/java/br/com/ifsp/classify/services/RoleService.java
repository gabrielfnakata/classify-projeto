package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.RoleCreateDTO;
import br.com.ifsp.classify.dtos.get.RoleGetDTO;
import br.com.ifsp.classify.dtos.update.RoleUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Role;
import br.com.ifsp.classify.repositories.RoleRepository;
import br.com.ifsp.classify.utils.Utils;
import org.springframework.stereotype.Service;

@Service
public class RoleService extends AbstractService<Role, RoleCreateDTO, RoleGetDTO, RoleUpdateDTO, String> {

    public RoleService(RoleRepository repository) {
        super(repository);
    }

    @Override
    RoleGetDTO returnDTO(Role role) {
        if (role == null)
            return null;

        return new RoleGetDTO(
                role.getId(),
                role.getDescription()
        );
    }

    public RoleGetDTO getById(String id) {
        Role role = repository
            .findById(id)
            .orElse(null);

        return returnDTO(role);
    }

    @Override
    public RoleGetDTO create(RoleCreateDTO roleDTO) {
        if (roleDTO == null)
            return null;

        if (Utils.isNullOrEmpty(roleDTO.id()))
            throw new DtoException("É necessário informar um id");
        else if (roleDTO.id().trim().length() != 5)
            throw new DtoException("O id deve possuir 5 caracteres");

        if (Utils.isNullOrEmpty(roleDTO.description()))
            throw new DtoException("A descrição do cargo não pode ser vazia");

        Role newRole = new Role();
        newRole.setId(Utils.trimAndUpper(roleDTO.id()));
        newRole.setDescription(Utils.trimAndUpper(roleDTO.description()));

        repository.save(newRole);

        return returnDTO(newRole);
    }

    @Override
    public RoleGetDTO update(String id, RoleUpdateDTO roleDTO) {
        Role role = repository
            .findById(id)
            .orElse(null);

        if (roleDTO == null || role == null)
            return null;

        if (!Utils.isNullOrEmpty(roleDTO.description()))
            role.setDescription(Utils.trimAndUpper(roleDTO.description()));

        repository.save(role);

        return returnDTO(role);
    }
}