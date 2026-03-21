package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.create.RoleCreateDTO;
import br.com.ifsp.classify.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class CargoService extends AbstractService<Role, RoleCreateDTO, Integer> {

    public CargoService(JpaRepository<Role, Integer> repository) {
        super(repository);
    }

    @Override
    RoleCreateDTO returnDTO(Role entity) {
        return null;
    }

    @Override
    public RoleCreateDTO create(RoleCreateDTO entity) {
        return null;
    }

    @Override
    public RoleCreateDTO update(Integer integer, RoleCreateDTO entity) {
        return null;
    }
}