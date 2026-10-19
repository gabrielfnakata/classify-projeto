package br.com.ifsp.classify.dtos.get;

import java.util.List;

import org.springframework.data.domain.Page;

public record PageResponseGetDTO<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean first,
    boolean last
) {
    public static <T> PageResponseGetDTO<T> from(Page<T> page) {
        return new PageResponseGetDTO<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }
}
