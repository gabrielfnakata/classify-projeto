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

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMs;
    private final long refreshExpirationMs;
    private static final String TOKEN_TYPE_CLAIM = "token_type";
    private static final String ACCESS_TYPE = "access";
    private static final String REFRESH_TYPE = "refresh";

    public JwtService( @Value("${security.jwt.secret}") String base64Secret, @Value("${security.jwt.expiration}") long expirationMs, @Value("${security.jwt.refresh-expiration}") long refreshExpirationMs ) {
        byte[] keyBytes = Base64.getDecoder().decode(base64Secret);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public String generateAccessToken(String cpf, String role) {
        return buildToken(cpf, expirationMs, Map.of(TOKEN_TYPE_CLAIM, ACCESS_TYPE, "role", role));
    }

    public String generateRefreshToken(String cpf) {
        return buildToken(cpf, refreshExpirationMs, Map.of(TOKEN_TYPE_CLAIM, REFRESH_TYPE));
    }

    public String extractCpf(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return (String) parseClaims(token).get("role");
    }

    public boolean isAccessTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return ACCESS_TYPE.equals(claims.get(TOKEN_TYPE_CLAIM))
                    && claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isRefreshTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return REFRESH_TYPE.equals(claims.get(TOKEN_TYPE_CLAIM))
                    && claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
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