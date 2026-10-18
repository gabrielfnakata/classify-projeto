package br.com.ifsp.classify.dtos.create;

import br.com.ifsp.classify.dtos.get.StudentGetDTO;

import java.util.List;

public record AssignFormToStudentsDTO(
        String formUuid,
        List<StudentGetDTO> students
) {
}
