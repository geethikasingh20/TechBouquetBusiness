package com.techbouquet.auth;

import com.techbouquet.auth.dto.AuthResponse;
import com.techbouquet.auth.dto.LoginRequest;
import com.techbouquet.auth.dto.RegisterRequest;
import com.techbouquet.config.JwtService;
import com.techbouquet.customer.Customer;
import com.techbouquet.customer.CustomerRepository;
import com.techbouquet.email.SendGridEmailService;
import java.time.Instant;
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

        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setEmail(request.getEmail().toLowerCase());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setRegisteredIp(ipAddress);
        customer.setCreatedAt(Instant.now());

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

        Customer customer = customerRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        customer.setLastLoginAt(Instant.now());
        customer.setLastLoginIp(ipAddress);
        customerRepository.save(customer);
        log.info("Login success user={} ip={}", customer.getEmail(), ipAddress);

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
}
