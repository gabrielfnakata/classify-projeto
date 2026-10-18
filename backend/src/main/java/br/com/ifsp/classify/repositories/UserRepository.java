package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.User;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends AbstractRepository<User, Long> {
    public Optional<User> findByEmail(String email);
}
