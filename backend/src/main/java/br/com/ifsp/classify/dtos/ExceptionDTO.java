package br.com.ifsp.classify.dtos;

public record ExceptionDTO(int status, String code, String message) {
    public ExceptionDTO(int status, String message) {
        this(status, "UNKNOWN_ERROR", message);
    }
}