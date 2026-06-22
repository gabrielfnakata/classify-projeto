package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Report;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends AbstractRepository<Report, Long> {}