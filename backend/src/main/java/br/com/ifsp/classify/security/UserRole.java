package br.com.ifsp.classify.security;

import java.util.Optional;

public enum UserRole {
    ADMIN,
    PROFESSOR,
    ESTUDANTE;

    public String authority() {
        return "ROLE_" + name();
    }

    public static Optional<UserRole> fromId(String id) {
        try {
            return Optional.of(valueOf(id));
        } catch (IllegalArgumentException | NullPointerException exception) {
            return Optional.empty();
        }
    }
}
