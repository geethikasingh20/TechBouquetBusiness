package com.techbouquet.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final SecretKey secretKey;
    private final String issuer;
    private final long ttlMinutes;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.issuer}") String issuer,
                      @Value("${app.jwt.ttlMinutes}") long ttlMinutes) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.issuer = issuer;
        this.ttlMinutes = ttlMinutes;
    }

    public String generateToken(String email) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(ttlMinutes * 60);
        return Jwts.builder()
                .issuer(issuer)
                .subject(email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(secretKey)
                .compact();
    }

    public String generateEmailVerificationToken(String email, long verifyTtlMinutes) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(verifyTtlMinutes * 60);
        return Jwts.builder()
                .issuer(issuer)
                .subject(email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .claims(Map.of("typ", "verify"))
                .signWith(secretKey)
                .compact();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, String username) {
        Claims claims = extractAllClaims(token);
        return claims.getSubject().equals(username) && !claims.getExpiration().before(new Date());
    }

    public String validateEmailVerificationToken(String token) {
        Claims claims = extractAllClaims(token);
        String type = claims.get("typ", String.class);
        if (!"verify".equals(type)) {
            return null;
        }
        if (claims.getExpiration().before(new Date())) {
            return null;
        }
        return claims.getSubject();
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
