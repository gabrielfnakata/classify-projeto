package br.com.ifsp.classify.dtos.get;

import java.time.LocalDateTime;
import java.util.List;

public record ClassSessionGetDTO(
        String uuid,
        SubjectTeacherGetDTO subjectTeacher,
        ClassroomGetDTO classroom,
        LocalDateTime startTime,
        LocalDateTime endTime,
        List<String> studentIds
) {}