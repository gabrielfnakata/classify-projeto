package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Role;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends AbstractRepository<Role, Integer> {}