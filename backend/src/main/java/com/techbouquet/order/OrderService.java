package com.techbouquet.order;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.techbouquet.address.AddressService;
import com.techbouquet.cart.Cart;
import com.techbouquet.cart.CartAddon;
import com.techbouquet.cart.CartItem;
import com.techbouquet.cart.CartItemRepository;
import com.techbouquet.cart.CartRepository;
import com.techbouquet.customer.Customer;
import com.techbouquet.customer.CustomerRepository;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderService {
    private static final DateTimeFormatter ORDER_NUMBER_TIME =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss", Locale.ROOT);

    private final CustomerRepository customerRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;
    private final AddressService addressService;
    private final Path storageRoot;

    public OrderService(CustomerRepository customerRepository,
                        CartRepository cartRepository,
                        CartItemRepository cartItemRepository,
                        OrderRepository orderRepository,
                        ObjectMapper objectMapper,
                        AddressService addressService,
                        @Value("${app.order.storage-dir:uploads/orders}") String storageDir) {
        this.customerRepository = customerRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.objectMapper = objectMapper;
        this.addressService = addressService;
        this.storageRoot = Path.of(storageDir).toAbsolutePath().normalize();
    }

    @Transactional
    public OrderCreationResponse placeOrder(String principalEmail,
                                            String checkoutJson,
                                            MultipartFile receiptFile) {
        Customer customer = customerRepository.findByEmail(principalEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required"));
        Cart cart = cartRepository.findByCustomer(customer)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty"));
        List<CartItem> cartItems = cartItemRepository.findByCartOrderByUpdatedAtDescIdDesc(cart);
        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        OrderCheckoutRequest checkoutRequest = parseCheckoutRequest(checkoutJson);
        Map<String, OrderCheckoutRequest.RecipientSnapshot> recipients = normalizeRecipients(checkoutRequest);
        validateRecipients(cartItems, recipients);

        String orderNumber = generateUniqueOrderNumber();
        String receiptPath = storeReceipt(orderNumber, receiptFile);
        Order order = buildOrder(customer, orderNumber, receiptPath, checkoutRequest, cartItems);
        order = orderRepository.save(order);

        clearCart(cartItems);

        return new OrderCreationResponse(
                "Order successfully placed",
                order.getOrderNumber(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                receiptReceiptUrl(order.getOrderNumber())
        );
    }

    public List<OrderResponse> getCustomerOrders(String principalEmail) {
        Customer customer = customerRepository.findByEmail(principalEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required"));
        return orderRepository.findByCustomerOrderByCreatedAtDesc(customer)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public OrderResponse getOrderForCustomer(String principalEmail, String orderNumber) {
        Customer customer = customerRepository.findByEmail(principalEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required"));
        Order order = orderRepository.findByOrderNumberAndCustomer(orderNumber, customer)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        return toResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(String orderNumber, OrderStatus status) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        order.setStatus(status);
        return toResponse(orderRepository.save(order));
    }

    public ResponseEntity<Resource> loadReceipt(String principalEmail, String orderNumber) {
        Customer customer = customerRepository.findByEmail(principalEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required"));
        Order order = orderRepository.findByOrderNumberAndCustomer(orderNumber, customer)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (order.getReceiptPath() == null || order.getReceiptPath().isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Receipt not found");
        }

        Path receipt = resolveReceipt(order.getReceiptPath());
        if (!Files.exists(receipt)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Receipt not found");
        }

        Resource resource = new FileSystemResource(receipt);
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            String probe = Files.probeContentType(receipt);
            if (probe != null && !probe.isBlank()) {
                mediaType = MediaType.parseMediaType(probe);
            }
        } catch (IOException ignored) {
            // Fall back to octet-stream when the mime type cannot be detected.
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + receipt.getFileName().toString() + "\"")
                .body(resource);
    }

    private Order buildOrder(Customer customer,
                             String orderNumber,
                             String receiptPath,
                             OrderCheckoutRequest checkoutRequest,
                             List<CartItem> cartItems) {
        Order order = new Order();
        order.setCustomer(customer);
        order.setOrderNumber(orderNumber);
        order.setStatus(OrderStatus.PLACED);
        order.setReceiptPath(receiptPath);
        order.setCheckoutSnapshotJson(serializeCheckoutSnapshot(checkoutRequest));

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(cartItem.getProduct().getId());
            orderItem.setProductName(cartItem.getProduct().getName());
            orderItem.setProductImageUrl(cartItem.getProduct().getImages().isEmpty()
                    ? null
                    : cartItem.getProduct().getImages().get(0).getUrl());
            orderItem.setDeliveryPincode(cartItem.getDeliveryPincode());
            orderItem.setQuantity(cartItem.getQuantity());

            BigDecimal unitPrice = cartItem.getProduct().getPrice();
            List<CartAddon> addons = parseAddons(cartItem.getAddonsJson());
            BigDecimal addonTotal = addons.stream()
                    .map(addon -> BigDecimal.valueOf(addon == null ? 0 : addon.getPrice()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal lineTotal = unitPrice.add(addonTotal)
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            orderItem.setUnitPrice(unitPrice);
            orderItem.setAddonTotal(addonTotal);
            orderItem.setLineTotal(lineTotal);
            orderItem.setAddonsJson(serializeAddons(addons));
            items.add(orderItem);
            total = total.add(lineTotal);
        }

        order.setItems(items);
        order.setTotalAmount(total);
        return order;
    }

    private void clearCart(List<CartItem> cartItems) {
        for (CartItem cartItem : cartItems) {
            cartItemRepository.delete(cartItem);
        }
    }

    private Map<String, OrderCheckoutRequest.RecipientSnapshot> normalizeRecipients(OrderCheckoutRequest checkoutRequest) {
        if (checkoutRequest == null || checkoutRequest.getRecipients() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Recipient details are required");
        }
        Map<String, OrderCheckoutRequest.RecipientSnapshot> recipients = new LinkedHashMap<>();
        checkoutRequest.getRecipients().forEach((key, value) -> {
            if (key != null && !key.isBlank() && value != null) {
                recipients.put(key.trim(), value);
            }
        });
        if (recipients.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Recipient details are required");
        }
        return recipients;
    }

    private OrderCheckoutRequest parseCheckoutRequest(String checkoutJson) {
        if (checkoutJson == null || checkoutJson.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Checkout details are required");
        }

        try {
            return objectMapper.readValue(checkoutJson, OrderCheckoutRequest.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid checkout details", e);
        }
    }

    private void validateRecipients(List<CartItem> cartItems,
                                    Map<String, OrderCheckoutRequest.RecipientSnapshot> recipients) {
        for (CartItem cartItem : cartItems) {
            String pincode = normalizePincode(cartItem.getDeliveryPincode());
            OrderCheckoutRequest.RecipientSnapshot recipient = recipients.get(pincode);
            if (recipient == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Missing recipient details for pincode " + pincode);
            }
            if (isBlank(recipient.getName()) || isBlank(recipient.getPhone())
                    || isBlank(recipient.getLine1()) || isBlank(recipient.getLine2())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Complete recipient details for pincode " + pincode);
            }
        }
    }

    private String generateUniqueOrderNumber() {
        for (int attempt = 0; attempt < 10; attempt++) {
            String candidate = "IN_BLR-" + ORDER_NUMBER_TIME.format(LocalDateTime.now(ZoneId.of("Asia/Kolkata")))
                    + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
            if (!orderRepository.existsByOrderNumber(candidate)) {
                return candidate;
            }
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to generate order number");
    }

    private String storeReceipt(String orderNumber, MultipartFile receiptFile) {
        if (receiptFile == null || receiptFile.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment receipt is required");
        }

        try {
            Files.createDirectories(storageRoot);
            Path orderDir = storageRoot.resolve(orderNumber);
            Files.createDirectories(orderDir);

            String originalName = receiptFile.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf('.'));
            }
            if (extension.isBlank()) {
                extension = ".bin";
            }

            Path target = orderDir.resolve("receipt" + extension);
            try (var inputStream = receiptFile.getInputStream()) {
                Files.copy(inputStream, target, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            }
            return storageRoot.relativize(target).toString().replace('\\', '/');
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to store receipt", e);
        }
    }

    private Path resolveReceipt(String receiptPath) {
        Path receipt = storageRoot.resolve(receiptPath).normalize();
        if (!receipt.startsWith(storageRoot)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid receipt path");
        }
        return receipt;
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getProductId(),
                        item.getProductName(),
                        item.getProductImageUrl(),
                        item.getDeliveryPincode(),
                        item.getUnitPrice(),
                        item.getAddonTotal(),
                        item.getQuantity(),
                        item.getLineTotal(),
                        parseAddons(item.getAddonsJson())
                ))
                .toList();
        return new OrderResponse(
                order.getOrderNumber(),
                order.getStatus(),
                order.getTotalAmount(),
                receiptReceiptUrl(order.getOrderNumber()),
                order.getCreatedAt(),
                items
        );
    }

    private String receiptReceiptUrl(String orderNumber) {
        return "/api/orders/" + orderNumber + "/receipt";
    }

    private String serializeCheckoutSnapshot(OrderCheckoutRequest request) {
        try {
            return objectMapper.writeValueAsString(request);
        } catch (Exception e) {
            return "{}";
        }
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

    private String serializeAddons(List<CartAddon> addons) {
        try {
            return objectMapper.writeValueAsString(addons);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String normalizePincode(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
