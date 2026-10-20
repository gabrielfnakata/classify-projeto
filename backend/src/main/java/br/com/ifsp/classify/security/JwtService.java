package br.com.ifsp.classify.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.Optional;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMs;
    private final long refreshExpirationMs;
    private final long passwordResetExpirationMs;
    private static final String TOKEN_TYPE_CLAIM = "token_type";
    private static final String ACCESS_TYPE = "access";
    private static final String REFRESH_TYPE = "refresh";
    private static final String PASSWORD_RESET_TYPE = "password_reset";
    private static final String PASSWORD_FINGERPRINT_CLAIM = "pwd";

    public JwtService( @Value("${security.jwt.secret}") String base64Secret,
                       @Value("${security.jwt.expiration}") long expirationMs,
                       @Value("${security.jwt.refresh-expiration}") long refreshExpirationMs,
                       @Value("${security.jwt.password-reset-expiration:1800000}") long passwordResetExpirationMs ) {

        byte[] keyBytes = Base64.getDecoder().decode(base64Secret);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
        this.passwordResetExpirationMs = passwordResetExpirationMs;
    }

    public String generateAccessToken(String email, String role) {
        return buildToken(email, expirationMs, Map.of(TOKEN_TYPE_CLAIM, ACCESS_TYPE, "role", role));
    }

    public String generateRefreshToken(String email) {
        return buildToken(email, refreshExpirationMs, Map.of(TOKEN_TYPE_CLAIM, REFRESH_TYPE));
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return (String) parseClaims(token).get("role");
    }

    public boolean isAccessTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return ACCESS_TYPE.equals(claims.get(TOKEN_TYPE_CLAIM)) && claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isRefreshTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return REFRESH_TYPE.equals(claims.get(TOKEN_TYPE_CLAIM)) && claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String generatePasswordResetToken(String email, String passwordFingerprint) {
        return buildToken(email, passwordResetExpirationMs,
                Map.of(TOKEN_TYPE_CLAIM, PASSWORD_RESET_TYPE, PASSWORD_FINGERPRINT_CLAIM, passwordFingerprint));
    }

    public Optional<PasswordResetClaims> parsePasswordResetToken(String token) {
        try {
            Claims claims = parseClaims(token);
            if (!PASSWORD_RESET_TYPE.equals(claims.get(TOKEN_TYPE_CLAIM)) || !claims.getExpiration().after(new Date()))
                return Optional.empty();

            return Optional.of(new PasswordResetClaims(claims.getSubject(), (String) claims.get(PASSWORD_FINGERPRINT_CLAIM)));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    public record PasswordResetClaims(String email, String passwordFingerprint) {}

    public String generateSignedToken(String type, String subject, Date expiresAt, Map<String, String> data) {
        Map<String, Object> claims = new java.util.HashMap<>(data);
        claims.put(TOKEN_TYPE_CLAIM, type);

        return Jwts.builder()
                .subject(subject)
                .issuedAt(new Date())
                .expiration(expiresAt)
                .claims(claims)
                .signWith(signingKey)
                .compact();
    }

    public Optional<Claims> parseSignedToken(String token, String type) {
        try {
            Claims claims = parseClaims(token);
            if (!type.equals(claims.get(TOKEN_TYPE_CLAIM)) || !claims.getExpiration().after(new Date()))
                return Optional.empty();
            return Optional.of(claims);
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    public long getPasswordResetExpirationMinutes() {
        return passwordResetExpirationMs / 60_000;
    }

    private String buildToken(String subject, long ttlMs, Map<String, ?> extraClaims) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + ttlMs);

        return Jwts.builder()
                .subject(subject)
                .issuedAt(now)
                .expiration(expiry)
                .claims(extraClaims)
                .signWith(signingKey)
                .compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
