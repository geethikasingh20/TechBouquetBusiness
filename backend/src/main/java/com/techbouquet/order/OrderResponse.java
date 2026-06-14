package com.techbouquet.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class OrderResponse {
    private final String orderNumber;
    private final OrderStatus status;
    private final BigDecimal totalAmount;
    private final String receiptUrl;
    private final Instant createdAt;
    private final List<OrderItemResponse> items;

    public OrderResponse(String orderNumber,
                         OrderStatus status,
                         BigDecimal totalAmount,
                         String receiptUrl,
                         Instant createdAt,
                         List<OrderItemResponse> items) {
        this.orderNumber = orderNumber;
        this.status = status;
        this.totalAmount = totalAmount;
        this.receiptUrl = receiptUrl;
        this.createdAt = createdAt;
        this.items = items;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getReceiptUrl() {
        return receiptUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }
}
