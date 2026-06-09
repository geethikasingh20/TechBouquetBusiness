package com.techbouquet.auth;

import com.techbouquet.auth.dto.AuthResponse;
import com.techbouquet.auth.dto.LoginRequest;
import com.techbouquet.auth.dto.RegisterRequest;
import com.techbouquet.config.JwtService;
import com.techbouquet.customer.Customer;
import com.techbouquet.customer.CustomerRepository;
import com.techbouquet.email.SendGridEmailService;
import java.time.Instant;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final SendGridEmailService emailService;

    @Value("${app.email.verifyUrlBase:http://localhost:8080/api/auth/verify-email?token=}")
    private String verifyUrlBase;

    @Value("${app.email.verifyTtlMinutes:1440}")
    private long verifyTtlMinutes;

    public AuthService(CustomerRepository customerRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       SendGridEmailService emailService) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    public AuthResponse register(RegisterRequest request, String ipAddress) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            log.info("Register blocked: email exists {}", request.getEmail());
            throw new IllegalArgumentException("Email already registered");
        }

        String normalizedEmail = request.getEmail().toLowerCase(Locale.ROOT);
        String maskedIp = maskIpForStorage(ipAddress);
        Instant now = Instant.now();

        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setEmail(normalizedEmail);
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setRegisteredIp(maskedIp);
        customer.setCreatedAt(now);
        // Registration response also logs user in, so keep first login metadata.
        customer.setLastLoginAt(now);
        customer.setLastLoginIp(maskedIp);

        Customer saved = customerRepository.save(customer);
        log.info("Registered user id={} email={}", saved.getId(), saved.getEmail());

        try {
            String verifyToken = jwtService.generateEmailVerificationToken(saved.getEmail(), verifyTtlMinutes);
            String verifyLink = verifyUrlBase + verifyToken;
            emailService.sendWelcomeEmail(saved.getEmail(), saved.getName(), verifyLink);
        } catch (Exception ex) {
            log.warn("Welcome email failed for {}", saved.getEmail(), ex);
        }

        String token = jwtService.generateToken(saved.getEmail());
        return new AuthResponse(token, saved.getName(), saved.isEmailVerified());
    }

    public AuthResponse login(LoginRequest request, String ipAddress) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String normalizedEmail = request.getEmail().toLowerCase(Locale.ROOT);
        String maskedIp = maskIpForStorage(ipAddress);

        Customer customer = customerRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        customer.setLastLoginAt(Instant.now());
        customer.setLastLoginIp(maskedIp);
        customerRepository.save(customer);
        log.info("Login success user={} ip={}", customer.getEmail(), maskedIp);

        String token = jwtService.generateToken(customer.getEmail());
        return new AuthResponse(token, customer.getName(), customer.isEmailVerified());
    }

    public void markEmailVerified(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        customer.setEmailVerified(true);
        customerRepository.save(customer);
        log.info("Email verified user={}", email);
    }

    public void verifyEmailToken(String token) {
        String email = jwtService.validateEmailVerificationToken(token);
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Invalid or expired verification token");
        }
        markEmailVerified(email);
    }

    private String maskIpForStorage(String ip) {
        if (ip == null || ip.isBlank()) {
            return "unknown";
        }
        // IPv4: keep first 3 octets
        if (ip.contains(".")) {
            int lastDot = ip.lastIndexOf('.');
            if (lastDot > 0) {
                return ip.substring(0, lastDot) + ".xxx";
            }
        }
        // IPv6: keep first 4 groups
        if (ip.contains(":")) {
            String[] parts = ip.split(":");
            StringBuilder masked = new StringBuilder();
            int keep = Math.min(4, parts.length);
            for (int i = 0; i < keep; i++) {
                if (i > 0) {
                    masked.append(':');
                }
                masked.append(parts[i].isBlank() ? "0" : parts[i]);
            }
            return masked.append(":xxxx:xxxx:xxxx:xxxx").toString();
        }
        return "masked";
    }
}
