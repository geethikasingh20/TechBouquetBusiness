package com.techbouquet.auth;

import com.techbouquet.auth.dto.AuthResponse;
import com.techbouquet.auth.dto.LoginRequest;
import com.techbouquet.auth.dto.RegisterRequest;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                                                 HttpServletRequest httpRequest) {
        String ip = extractClientIp(httpRequest);
        return ResponseEntity.ok(authService.register(request, ip));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletRequest httpRequest) {
        String ip = extractClientIp(httpRequest);
        return ResponseEntity.ok(authService.login(request, ip));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(Principal principal) {
        authService.markEmailVerified(principal.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
