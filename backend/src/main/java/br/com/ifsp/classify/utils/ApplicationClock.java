package br.com.ifsp.classify.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * "Agora" no fuso da escola.
 *
 * O contêiner roda em UTC, então {@code LocalDateTime.now()} fica 3 horas à frente do relógio
 * de quem usa o sistema: uma aula das 17:00 já contaria como passada às 14:00. Os horários
 * gravados são nominais (o que a tela mostra), então só o "agora" precisa de ajuste — mudar o
 * fuso da JVM inteira faria o driver reinterpretar o que já está no banco.
 */
@Component
public class ApplicationClock {

    private final ZoneId zone;

    public ApplicationClock(@Value("${classify.timezone:America/Sao_Paulo}") String timezone) {
        this.zone = ZoneId.of(timezone);
    }

    public LocalDateTime now() {
        return LocalDateTime.now(zone);
    }

    public LocalDate today() {
        return LocalDate.now(zone);
    }
}
