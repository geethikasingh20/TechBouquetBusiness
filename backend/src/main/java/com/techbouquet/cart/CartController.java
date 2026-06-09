package com.techbouquet.cart;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.techbouquet.customer.Customer;
import com.techbouquet.customer.CustomerRepository;
import com.techbouquet.product.Product;
import com.techbouquet.product.ProductRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
        List<CartItem> items = cartItemRepository.findByCartOrderByUpdatedAtDescIdDesc(cart);
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
        String deliveryPincode = normalizeDeliveryPincode(request.getDeliveryPincode());

        List<CartAddon> incomingAddons = normalizeUniqueAddons(parseAddons(addonsJson));
        CartItem existing = cartItemRepository.findByCartAndProductAndDeliveryPincode(cart, product, deliveryPincode)
                .orElse(null);

        if (existing == null) {
            CartItem created = new CartItem();
            created.setCart(cart);
            created.setProduct(product);
            created.setAddonsJson(serializeAddons(incomingAddons));
            created.setDeliveryPincode(deliveryPincode);
            created.setQuantity(1);
            cartItemRepository.save(created);
        } else {
            List<CartAddon> existingAddons = normalizeUniqueAddons(parseAddons(existing.getAddonsJson()));
            List<CartAddon> mergedAddons = mergeAddons(existingAddons, incomingAddons);
            boolean sameAddonSet = addonsEqual(existingAddons, incomingAddons);

            existing.setAddonsJson(serializeAddons(mergedAddons));
            if (sameAddonSet) {
                existing.setQuantity(existing.getQuantity() + 1);
            }
            cartItemRepository.save(existing);
        }
        log.info("Cart add upsert user={} productId={} pincode={}", principal.getName(), product.getId(), deliveryPincode);

        List<CartItem> items = cartItemRepository.findByCartOrderByUpdatedAtDescIdDesc(cart);
        return toResponse(items);
    }

    @PatchMapping("/items/{id}")
    @Transactional
    public ResponseEntity<List<CartItemResponse>> updateQuantity(@PathVariable Long id,
                                                                 @RequestBody CartItemQuantityRequest request,
                                                                 java.security.Principal principal) {
        Cart cart = getOrCreateCart(principal);
        int qty = Math.max(1, request.getQuantity());
        cartItemRepository.updateQuantityAndTouch(id, qty);
        log.info("Cart update user={} itemId={} qty={}", principal.getName(), id, qty);
        return ResponseEntity.ok(toResponse(cartItemRepository.findByCartOrderByUpdatedAtDescIdDesc(cart)));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<List<CartItemResponse>> removeItem(@PathVariable Long id, java.security.Principal principal) {
        Cart cart = getOrCreateCart(principal);
        cartItemRepository.deleteById(id);
        log.info("Cart remove user={} itemId={}", principal.getName(), id);
        return ResponseEntity.ok(toResponse(cartItemRepository.findByCartOrderByUpdatedAtDescIdDesc(cart)));
    }

    @DeleteMapping("/clear")
    public List<CartItemResponse> clear(java.security.Principal principal) {
        Cart cart = getOrCreateCart(principal);
        cartItemRepository.findByCartOrderByUpdatedAtDescIdDesc(cart).forEach(item -> cartItemRepository.deleteById(item.getId()));
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

    private String normalizeDeliveryPincode(String deliveryPincode) {
        if (deliveryPincode == null || deliveryPincode.isBlank()) {
            return "";
        }
        return deliveryPincode;
    }

    private List<CartAddon> mergeAddons(List<CartAddon> existing, List<CartAddon> incoming) {
        Map<String, CartAddon> merged = new LinkedHashMap<>();
        for (CartAddon addon : existing) {
            if (addon == null || addon.getId() == null) continue;
            merged.put(addon.getId(), addon);
        }
        for (CartAddon addon : incoming) {
            if (addon == null || addon.getId() == null) continue;
            merged.putIfAbsent(addon.getId(), addon);
        }
        return new ArrayList<>(merged.values());
    }

    private List<CartAddon> normalizeUniqueAddons(List<CartAddon> addons) {
        return mergeAddons(List.of(), addons);
    }

    private boolean addonsEqual(List<CartAddon> existing, List<CartAddon> incoming) {
        if (existing.size() != incoming.size()) {
            return false;
        }
        List<String> leftIds = existing.stream()
                .map(addon -> addon == null ? null : String.valueOf(addon.getId()))
                .filter(id -> id != null && !id.isBlank())
                .sorted()
                .toList();
        List<String> rightIds = incoming.stream()
                .map(addon -> addon == null ? null : String.valueOf(addon.getId()))
                .filter(id -> id != null && !id.isBlank())
                .sorted()
                .toList();
        return leftIds.equals(rightIds);
    }

    private String serializeAddons(List<CartAddon> addons) {
        try {
            return objectMapper.writeValueAsString(addons);
        } catch (Exception e) {
            return "[]";
        }
    }

    private List<CartItemResponse> toResponse(List<CartItem> items) {
        List<CartItemResponse> responses = new ArrayList<>();
        for (CartItem item : items) {
            List<CartAddon> addons = parseAddons(item.getAddonsJson());
            int price = item.getProduct().getPrice().intValue();
            String imageUrl = item.getProduct().getImages().isEmpty()
                    ? null
                    : item.getProduct().getImages().get(0).getUrl();
            responses.add(new CartItemResponse(
                    item.getId(),
                    item.getProduct().getId(),
                    item.getProduct().getName(),
                    price,
                    item.getQuantity(),
                    addons,
                    imageUrl,
                    item.getDeliveryPincode()
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
