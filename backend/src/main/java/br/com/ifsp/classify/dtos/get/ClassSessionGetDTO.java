package br.com.ifsp.classify.dtos.get;

import java.time.LocalDateTime;
import java.util.List;

public record ClassSessionGetDTO(
        String uuid,
        ClassSessionSubjectTeacherGetDTO subjectTeacher,
        ClassSessionClassroomGetDTO classroom,
        LocalDateTime startTime,
        LocalDateTime endTime,
        List<ClassSessionStudentGetDTO> students
) {}