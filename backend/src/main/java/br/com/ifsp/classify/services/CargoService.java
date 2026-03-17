package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.CargoDTO;
import br.com.ifsp.classify.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class CargoService extends BaseService<Role, CargoDTO, Integer> {

    public CargoService(JpaRepository<Role, Integer> repository) {
        super(repository);
    }

    @Override
    CargoDTO returnDTO(Role entity) {
        return null;
    }

    @Override
    public CargoDTO create(CargoDTO entity) {
        return null;
    }

    @Override
    public CargoDTO update(Integer integer, CargoDTO entity) {
        return null;
    }
}