package br.com.ifsp.classify.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface AbstractRepository<Model, ID> extends JpaRepository<Model, ID>, JpaSpecificationExecutor<Model> {}