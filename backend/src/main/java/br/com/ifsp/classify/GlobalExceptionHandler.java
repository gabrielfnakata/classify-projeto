package br.com.ifsp.classify;

import java.util.Objects;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import br.com.ifsp.classify.dtos.ExceptionDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.exceptions.ExceptionCode;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DtoException.class)
    public ResponseEntity<ExceptionDTO> handleDtoException(DtoException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ExceptionDTO(
                        HttpStatus.BAD_REQUEST.value(),
                        exception.getCode(),
                        exception.getMessage())
                );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ExceptionDTO> handleDataIntegrityViolation(DataIntegrityViolationException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ExceptionDTO(HttpStatus.CONFLICT.value(),ExceptionCode.DATA_INTEGRITY.getCode(),
                        "Não foi possível salvar: já existe um registro com esses dados."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ExceptionDTO> handleMethodArgumentNotValid(MethodArgumentNotValidException exception) {
        FieldError firstError = exception.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .orElse(null);

        String message = Objects.requireNonNullElse(firstError != null ? firstError.getDefaultMessage() : null,
                "Os dados informados não são válidos.");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ExceptionDTO(
                        HttpStatus.BAD_REQUEST.value(),
                        ExceptionCode.VALIDATION_ERROR.getCode(),
                        message));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ExceptionDTO> handleBadCredentials(BadCredentialsException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ExceptionDTO(
                        HttpStatus.UNAUTHORIZED.value(),
                        ExceptionCode.INVALID_CREDENTIALS.getCode(),
                        "E-mail ou senha inválidos."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionDTO> handleGenericException(Exception exception) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ExceptionDTO(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        ExceptionCode.INTERNAL_ERROR.getCode(),
                        "Ocorreu um erro inesperado. Tente novamente mais tarde."));
    }
}