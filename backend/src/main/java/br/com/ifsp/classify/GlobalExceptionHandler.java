package br.com.ifsp.classify;

import br.com.ifsp.classify.dtos.ExceptionDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DtoException.class)
    public ResponseEntity<ExceptionDTO> handleDtoException(DtoException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body( new ExceptionDTO(HttpStatus.BAD_REQUEST.value(),
                                        exception.getMessage()) );
    }
}