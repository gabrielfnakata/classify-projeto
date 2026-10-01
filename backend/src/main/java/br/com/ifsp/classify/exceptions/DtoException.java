package br.com.ifsp.classify.exceptions;

public class DtoException extends RuntimeException {

    private final String code;

    public DtoException(String message) {
        this(ExceptionCode.VALIDATION_ERROR, message);
    }

    public DtoException(ExceptionCode code, String message) {
        super(message);
        this.code = code.getCode();
    }

    public String getCode() {
        return code;
    }
}
