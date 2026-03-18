package br.com.ifsp.classify.dtos.get;

public record SubjectTeacherGetDTO(
        String uuid,
        EmployeeGetDTO employee,
        SubjectGetDTO subject
) {}