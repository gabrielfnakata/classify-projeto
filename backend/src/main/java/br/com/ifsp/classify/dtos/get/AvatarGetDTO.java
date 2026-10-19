package br.com.ifsp.classify.dtos.get;

import java.time.LocalDateTime;

public record AvatarGetDTO(
        String preset,
        boolean hasPhoto,
        LocalDateTime updatedAt
) {}
