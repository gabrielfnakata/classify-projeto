package br.com.ifsp.classify.dtos.update;

import java.time.LocalDateTime;

public record ClassSessionUpdateDTO(
    String subjectTeacherId,
    String classRoomId,
    LocalDateTime startTime,
    LocalDateTime endTime
) {}