package com.example.boxcha.security;

import com.example.boxcha.entity.Role;
import com.example.boxcha.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtService {
    public static String TOKEN_PREFIX = "Bearer ";
    private static final String SECRET = "fdjskf8w7e4r8werfjdsfl9a8sdf8wer89f8sdf8wer9dsf89w8";

    public String generateToken(User user) {
        return TOKEN_PREFIX + Jwts.builder()
                .subject(user.getEmail())
                .claim("email", user.getEmail())
                .claim("id", user.getId())
                .claim("active", user.getIsActive())
                .claim("roles", user.getRoles().stream().map(Role::getRole).collect(Collectors.joining(", ")))
                .issuedAt(new Date())
                .expiration(new Date(new Date().getTime() + 1000 * 60 * 60 * 24))
                .signWith(getSecretKey())
                .compact();
    }

    public String generateRefreshToken(User user) {
        return TOKEN_PREFIX + Jwts.builder()
                .subject(user.getEmail())
                .claim("email", user.getEmail())
                .claim("id", user.getId())
                .claim("active", user.getIsActive())
                .claim("roles", user.getRoles().stream().map(Role::getRole).collect(Collectors.joining(", ")))
                .issuedAt(new Date())
                .expiration(new Date(new Date().getTime() + 1000L * 60 * 60 * 24 * 30))
                .signWith(getSecretKey())
                .compact();
    }

    public Boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSecretKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public User getUserObject(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        String email = claims.getSubject();
        String roles = (String) claims.get("roles");
        Long id = claims.get("id", Long.class);
        Boolean active = claims.get("active", Boolean.class); // Active ni olish
        List<Role> authorities = Arrays.stream(roles.split(",")).map(Role::new).toList();
        return User.builder()
                .id(id)
                .email(email)
                .roles(authorities)
                .isActive(active)
                .build();
    }
}
