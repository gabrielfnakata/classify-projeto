package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.RoleCreateDTO;
import br.com.ifsp.classify.dtos.get.RoleGetDTO;
import br.com.ifsp.classify.dtos.update.RoleUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Role;
import br.com.ifsp.classify.repositories.RoleRepository;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;
import org.springframework.stereotype.Service;

@Service
public class RoleService extends AbstractService<Role, RoleCreateDTO, RoleGetDTO, RoleUpdateDTO, Integer> {

    public RoleService(RoleRepository repository) {
        super(repository);
    }

    @Override
    RoleGetDTO returnDTO(Role role) {
        if (role == null)
            return null;

        return new RoleGetDTO(
                UuidUtils.convertBytesToString(role.getUuid()),
                role.getDescription()
        );
    }

    @Override
    public RoleGetDTO create(RoleCreateDTO roleDTO) {
        if (roleDTO == null)
            return null;

        if (Utils.isNullOrEmpty(roleDTO.description()))
            throw new DtoException("A descrição do cargo não pode ser vazia");

        Role newRole = new Role();
        newRole.setUuid(UuidUtils.generateUUID());
        newRole.setDescription(roleDTO.description().trim().toUpperCase());

        repository.save(newRole);

        return returnDTO(newRole);
    }

    @Override
    public RoleGetDTO update(String uuid, RoleUpdateDTO roleDTO) {
        Role role = getEntityById(uuid);
        if (roleDTO == null || role == null)
            return null;

        if (!Utils.isNullOrEmpty(roleDTO.description()))
            role.setDescription(roleDTO.description().trim().toUpperCase());

        repository.save(role);

        return returnDTO(role);
    }
}