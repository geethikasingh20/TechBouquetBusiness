package com.techbouquet.customer;

import java.security.Principal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class CustomerController {
    private final CustomerRepository customerRepository;

    public CustomerController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<CustomerProfileResponse> me(Principal principal) {
        return customerRepository.findByEmail(principal.getName())
                .map(c -> ResponseEntity.ok(
                        new CustomerProfileResponse(c.getId(), c.getName(), c.getEmail(), c.getPhoneNumber(), c.isEmailVerified())
                ))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
