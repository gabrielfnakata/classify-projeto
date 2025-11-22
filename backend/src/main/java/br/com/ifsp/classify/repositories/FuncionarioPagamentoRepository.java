package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.FuncionarioPagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FuncionarioPagamentoRepository extends JpaRepository<FuncionarioPagamento, Long> {}