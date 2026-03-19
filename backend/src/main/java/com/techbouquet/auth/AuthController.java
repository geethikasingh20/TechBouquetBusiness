package com.techbouquet.auth;

import com.techbouquet.auth.dto.AuthResponse;
import com.techbouquet.auth.dto.LoginRequest;
import com.techbouquet.auth.dto.RegisterRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.security.Principal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                                                 HttpServletRequest httpRequest) {
        String ip = extractClientIp(httpRequest);
        log.info("Register attempt email={} ip={}", request.getEmail(), maskIp(ip));
        return ResponseEntity.ok(authService.register(request, ip));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletRequest httpRequest) {
        String ip = extractClientIp(httpRequest);
        log.info("Login attempt email={} ip={}", request.getEmail(), maskIp(ip));
        return ResponseEntity.ok(authService.login(request, ip));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(Principal principal) {
        log.info("Email verify request user={}", principal.getName());
        authService.markEmailVerified(principal.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        log.info("Logout request");
        return ResponseEntity.ok().build();
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String maskIp(String ip) {
        if (ip == null) return "unknown";
        int lastDot = ip.lastIndexOf('.');
        if (lastDot > 0) {
            return ip.substring(0, lastDot) + ".xxx";
        }
        return ip;
    }
}
