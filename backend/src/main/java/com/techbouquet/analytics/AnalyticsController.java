package com.techbouquet.analytics;

import com.techbouquet.customer.Customer;
import com.techbouquet.customer.CustomerRepository;
import com.techbouquet.product.Product;
import com.techbouquet.product.ProductRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    private static final Logger log = LoggerFactory.getLogger(AnalyticsController.class);
    private final AnalyticsRepository analyticsRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public AnalyticsController(AnalyticsRepository analyticsRepository,
                               CustomerRepository customerRepository,
                               ProductRepository productRepository) {
        this.analyticsRepository = analyticsRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    @PostMapping("/track")
    public ResponseEntity<Void> track(@RequestBody AnalyticsRequest request,
                                      Principal principal,
                                      HttpServletRequest httpRequest) {
        AnalyticsEvent event = new AnalyticsEvent();
        event.setEventType(request.getEventType());
        event.setKeyword(request.getKeyword());
        event.setLocation(request.getLocation());
        event.setZone(request.getZone());
        event.setIpAddress(extractClientIp(httpRequest));

        if (request.getProductId() != null) {
            Product product = productRepository.findById(request.getProductId()).orElse(null);
            event.setProduct(product);
        }

        if (principal != null) {
            Customer customer = customerRepository.findByEmail(principal.getName()).orElse(null);
            event.setCustomer(customer);
        }

        analyticsRepository.save(event);
        log.info("Analytics event type={} productId={} keyword={} user={}",
                request.getEventType(), request.getProductId(), request.getKeyword(), principal != null ? principal.getName() : "guest");
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
