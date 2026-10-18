package br.com.ifsp.classify.repositories;

import br.com.ifsp.classify.models.Attendance;
import org.springframework.stereotype.Repository;

@Repository
public interface AttendanceRepository extends AbstractRepository<Attendance, Long> {}
