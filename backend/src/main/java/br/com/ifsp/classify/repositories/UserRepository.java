package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.User;

import java.util.Optional;

public interface UserRepository extends AbstractRepository<User, Long> {
    public Optional<User> findByEmail(String email);
}
