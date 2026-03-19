package com.techbouquet.cart;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.techbouquet.customer.Customer;
import com.techbouquet.customer.CustomerRepository;
import com.techbouquet.product.Product;
import com.techbouquet.product.ProductRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
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
        log.info("Cart fetch user={} items={}", principal.getName(), cart.getItems().size());
        return toResponse(cart.getItems());
    }

    @PostMapping("/items")
    public List<CartItemResponse> addItem(@RequestBody CartItemRequest request, java.security.Principal principal) throws Exception {
        Cart cart = getOrCreateCart(principal);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        String addonsJson = request.getAddonsJson() == null ? "[]" : request.getAddonsJson();

        Optional<CartItem> existing = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId())
                        && addonsJson.equals(item.getAddonsJson()))
                .findFirst();

        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + 1);
            log.info("Cart add existing user={} productId={} qty={}", principal.getName(), product.getId(), item.getQuantity());
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setAddonsJson(addonsJson);
            cart.getItems().add(item);
            log.info("Cart add new user={} productId={} qty=1", principal.getName(), product.getId());
        }

        cartRepository.save(cart);
        return toResponse(cart.getItems());
    }

    @PatchMapping("/items/{id}")
    public ResponseEntity<List<CartItemResponse>> updateQuantity(@PathVariable Long id,
                                                                 @RequestBody CartItemQuantityRequest request,
                                                                 java.security.Principal principal) {
        Cart cart = getOrCreateCart(principal);
        for (CartItem item : cart.getItems()) {
            if (item.getId().equals(id)) {
                item.setQuantity(Math.max(1, request.getQuantity()));
                log.info("Cart update user={} itemId={} qty={}", principal.getName(), id, item.getQuantity());
            }
        }
        cartRepository.save(cart);
        return ResponseEntity.ok(toResponse(cart.getItems()));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<List<CartItemResponse>> removeItem(@PathVariable Long id, java.security.Principal principal) {
        Cart cart = getOrCreateCart(principal);
        cart.getItems().removeIf(item -> item.getId().equals(id));
        cartRepository.save(cart);
        log.info("Cart remove user={} itemId={}", principal.getName(), id);
        return ResponseEntity.ok(toResponse(cart.getItems()));
    }

    @DeleteMapping("/clear")
    public List<CartItemResponse> clear(java.security.Principal principal) {
        Cart cart = getOrCreateCart(principal);
        cart.getItems().clear();
        cartRepository.save(cart);
        log.info("Cart clear user={}", principal.getName());
        return toResponse(cart.getItems());
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
