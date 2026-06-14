package com.techbouquet.order;

import java.security.Principal;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public OrderCreationResponse placeOrder(@RequestPart("checkoutData") String checkoutData,
                                            @RequestPart("receipt") MultipartFile receipt,
                                            Principal principal) {
        return orderService.placeOrder(principal.getName(), checkoutData, receipt);
    }

    @GetMapping("/me")
    public List<OrderResponse> myOrders(Principal principal) {
        return orderService.getCustomerOrders(principal.getName());
    }

    @GetMapping("/{orderNumber}")
    public OrderResponse orderDetails(@PathVariable String orderNumber, Principal principal) {
        return orderService.getOrderForCustomer(principal.getName(), orderNumber);
    }

    @GetMapping("/{orderNumber}/receipt")
    public ResponseEntity<?> receipt(@PathVariable String orderNumber, Principal principal) {
        return orderService.loadReceipt(principal.getName(), orderNumber);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{orderNumber}/status/{status}")
    public OrderResponse updateStatus(@PathVariable String orderNumber,
                                      @PathVariable OrderStatus status) {
        return orderService.updateOrderStatus(orderNumber, status);
    }
}
