package br.com.ifsp.classify.dtos.update;

public record ScheduleRequestAnswerDTO(
        String token,
        String classroomUuid,
        String reason
) {}
