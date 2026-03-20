package com.techbouquet.cart;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.techbouquet.customer.Customer;
import com.techbouquet.customer.CustomerRepository;
import com.techbouquet.product.Product;
import com.techbouquet.product.ProductRepository;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private static final Logger log = LoggerFactory.getLogger(CartController.class);
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    public CartController(CartRepository cartRepository,
                          CartItemRepository cartItemRepository,
                          CustomerRepository customerRepository,
                          ProductRepository productRepository,
                          ObjectMapper objectMapper) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public List<CartItemResponse> getCart(java.security.Principal principal) {
        Cart cart = getOrCreateCart(principal);
        List<CartItem> items = cartItemRepository.findByCart(cart);
        log.info("Cart fetch user={} items={}", principal.getName(), items.size());
        return toResponse(items);
    }

    @PostMapping("/items")
    @Transactional
    public List<CartItemResponse> addItem(@RequestBody CartItemRequest request, java.security.Principal principal) {
        Cart cart = getOrCreateCart(principal);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        String addonsJson = normalizeAddonsJson(request.getAddonsJson());

        cartItemRepository.upsertIncrement(cart.getId(), product.getId(), addonsJson);
        log.info("Cart add upsert user={} productId={}", principal.getName(), product.getId());

        List<CartItem> items = cartItemRepository.findByCart(cart);
        return toResponse(items);
    }

    @PatchMapping("/items/{id}")
    public ResponseEntity<List<CartItemResponse>> updateQuantity(@PathVariable Long id,
                                                                 @RequestBody CartItemQuantityRequest request,
                                                                 java.security.Principal principal) {
        Cart cart = getOrCreateCart(principal);
        List<CartItem> items = cartItemRepository.findByCart(cart);
        for (CartItem item : items) {
            if (item.getId().equals(id)) {
                item.setQuantity(Math.max(1, request.getQuantity()));
                cartItemRepository.save(item);
                log.info("Cart update user={} itemId={} qty={}", principal.getName(), id, item.getQuantity());
            }
        }
        return ResponseEntity.ok(toResponse(cartItemRepository.findByCart(cart)));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<List<CartItemResponse>> removeItem(@PathVariable Long id, java.security.Principal principal) {
        Cart cart = getOrCreateCart(principal);
        cartItemRepository.deleteById(id);
        log.info("Cart remove user={} itemId={}", principal.getName(), id);
        return ResponseEntity.ok(toResponse(cartItemRepository.findByCart(cart)));
    }

    @DeleteMapping("/clear")
    public List<CartItemResponse> clear(java.security.Principal principal) {
        Cart cart = getOrCreateCart(principal);
        cartItemRepository.findByCart(cart).forEach(item -> cartItemRepository.deleteById(item.getId()));
        log.info("Cart clear user={}", principal.getName());
        return List.of();
    }

    private Cart getOrCreateCart(java.security.Principal principal) {
        Customer customer = customerRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return cartRepository.findByCustomer(customer)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setCustomer(customer);
                    return cartRepository.save(cart);
                });
    }

    private String normalizeAddonsJson(String addonsJson) {
        if (addonsJson == null || addonsJson.isBlank()) {
            return "[]";
        }
        return addonsJson;
    }

    private List<CartItemResponse> toResponse(List<CartItem> items) {
        List<CartItemResponse> responses = new ArrayList<>();
        for (CartItem item : items) {
            List<CartAddon> addons = parseAddons(item.getAddonsJson());
            int price = item.getProduct().getPrice().intValue();
            responses.add(new CartItemResponse(
                    item.getId(),
                    item.getProduct().getId(),
                    item.getProduct().getName(),
                    price,
                    item.getQuantity(),
                    addons
            ));
        }
        return responses;
    }

    private List<CartAddon> parseAddons(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<CartAddon>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}
