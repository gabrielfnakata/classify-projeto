package br.com.ifsp.classify.dtos.create;

import java.time.LocalDateTime;
import java.util.List;

public record ClassSessionCreateDTO(
        String subjectTeacherId,
        String classroomId,
        LocalDateTime startTime,
        LocalDateTime endTime,
        List<String> studentIds
) {}