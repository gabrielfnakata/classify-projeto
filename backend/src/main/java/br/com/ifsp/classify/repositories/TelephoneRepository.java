package br.com.ifsp.classify.repositories;

import org.springframework.stereotype.Repository;

import br.com.ifsp.classify.models.Telephone;

@Repository
public interface TelephoneRepository extends AbstractRepository<Telephone, Long> {}