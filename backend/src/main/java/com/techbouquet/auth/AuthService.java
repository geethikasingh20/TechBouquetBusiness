package com.techbouquet.auth;

import com.techbouquet.auth.dto.AuthResponse;
import com.techbouquet.auth.dto.LoginRequest;
import com.techbouquet.auth.dto.RegisterRequest;
import com.techbouquet.config.JwtService;
import com.techbouquet.customer.Customer;
import com.techbouquet.customer.CustomerRepository;
import java.time.Instant;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(CustomerRepository customerRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request, String ipAddress) {
        if (customerRepository.existsByEmail(request.getEmail())) {
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

        String token = jwtService.generateToken(customer.getEmail());
        return new AuthResponse(token, customer.getName(), customer.isEmailVerified());
    }

    public void markEmailVerified(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        customer.setEmailVerified(true);
        customerRepository.save(customer);
    }
}
