package br.com.ifsp.classify.models.enums;

import java.util.Locale;

import br.com.ifsp.classify.utils.Utils;

public enum ThemeAccent {

    BLUE,
    GREEN,
    RED,
    PURPLE,
    ORANGE,
    GRAY;

    public String value() {
        return name().toLowerCase(Locale.ROOT);
    }

    public static ThemeAccent fromString(String accent) {
        String normalized = Utils.trimAndUpper(accent);
        if (normalized == null)
            return null;

        for (ThemeAccent value : values())
            if (value.name().equals(normalized))
                return value;

        return null;
    }
}
