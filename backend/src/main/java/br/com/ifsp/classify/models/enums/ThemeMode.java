package br.com.ifsp.classify.models.enums;

import java.util.Locale;

import br.com.ifsp.classify.utils.Utils;

public enum ThemeMode {

    LIGHT,
    DARK,
    SYSTEM;

    public String value() {
        return name().toLowerCase(Locale.ROOT);
    }

    public static ThemeMode fromString(String mode) {
        String normalized = Utils.trimAndUpper(mode);
        if (normalized == null)
            return null;

        for (ThemeMode value : values())
            if (value.name().equals(normalized))
                return value;

        return null;
    }
}
