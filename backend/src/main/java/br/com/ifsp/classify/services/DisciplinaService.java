package br.com.ifsp.classify.services;

import br.com.ifsp.classify.dtos.DisciplinaDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Disciplina;
import br.com.ifsp.classify.repositories.DisciplinaRepository;
import br.com.ifsp.classify.utils.Utils;
import jdk.jshell.execution.Util;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DisciplinaService implements BaseService<DisciplinaDTO, Integer> {

    private final DisciplinaRepository disciplinaRepository;

    public DisciplinaService(DisciplinaRepository disciplinaRepository) {
        this.disciplinaRepository = disciplinaRepository;
    }

    @Override
    public List<DisciplinaDTO> findAll() {
        return disciplinaRepository.findAll()
                .stream()
                .map(this::returnDisciplinaDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DisciplinaDTO findById(Integer id) {
        return returnDisciplinaDTO(getDisciplinaById(id));
    }

    @Override
    public DisciplinaDTO create(DisciplinaDTO entity) {
        if (entity == null)
            return null;

        if (Utils.isNullOrEmpty(entity.descricao()))
            throw new DtoException("Descrição inválida");

        Disciplina newDisciplina = new Disciplina();
        newDisciplina.setDescricao(entity.descricao().trim());

        disciplinaRepository.save(newDisciplina);

        return returnDisciplinaDTO(newDisciplina);
    }

    @Override
    public DisciplinaDTO update(Integer id, DisciplinaDTO entity) {
        Disciplina disciplina = getDisciplinaById(id);
        if (disciplina == null)
            return null;

        if (!Utils.isNullOrEmpty(entity.descricao()))
            disciplina.setDescricao(entity.descricao().trim());

        disciplinaRepository.save(disciplina);

        return returnDisciplinaDTO(disciplina);
    }

    @Override
    public ResponseEntity<Void> delete(Integer id) {
        Disciplina disciplina = getDisciplinaById(id);
        if (disciplina == null)
            return ResponseEntity.badRequest().build();

        disciplinaRepository.delete(disciplina);
        return ResponseEntity.noContent().build();
    }

    private Disciplina getDisciplinaById(Integer id) {
        return (id == null) ?
                null :
                disciplinaRepository.findById(id).orElse(null);
    }

    private DisciplinaDTO returnDisciplinaDTO(Disciplina disciplina) {
        if (disciplina == null)
            return null;

        return new DisciplinaDTO(disciplina.getId(), disciplina.getDescricao());
    }
}