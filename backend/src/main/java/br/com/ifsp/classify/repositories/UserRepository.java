package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.User;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends AbstractRepository<User, Long> {}