package br.com.ifsp.classify.models.enums;

import br.com.ifsp.classify.utils.Utils;

/**
 * Situação da aula. Cancelar mantém o registro no histórico (diferente de excluir, que apaga),
 * libera o horário do professor e da sala e impede a chamada.
 */
public enum ClassSessionStatus {

    SCHEDULED,
    CANCELED;

    public static ClassSessionStatus fromString(String status) {
        String normalized = Utils.trimAndUpper(status);
        if (normalized == null)
            return null;

        for (ClassSessionStatus value : values())
            if (value.name().equals(normalized))
                return value;

        return null;
    }
}
