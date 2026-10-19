package br.com.ifsp.classify.repositories;

import java.util.Optional;

import br.com.ifsp.classify.models.UserAvatar;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAvatarRepository extends AbstractRepository<UserAvatar, Long> {

    Optional<UserAvatar> findByUserEmail(String email);
}
