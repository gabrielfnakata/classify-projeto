package br.com.ifsp.classify.dtos.get;

public record SubjectTeacherGetDTO(
        String uuid,
        SubjectTeacherEmployeeGetDTO employee,
        SubjectGetDTO subject
) {}