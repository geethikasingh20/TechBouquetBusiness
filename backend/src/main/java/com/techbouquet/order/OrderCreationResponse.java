package com.techbouquet.order;

import java.math.BigDecimal;
import java.time.Instant;

public class OrderCreationResponse {
    private final String message;
    private final String orderNumber;
    private final OrderStatus status;
    private final BigDecimal totalAmount;
    private final Instant createdAt;
    private final String receiptUrl;

    public OrderCreationResponse(String message,
                                 String orderNumber,
                                 OrderStatus status,
                                 BigDecimal totalAmount,
                                 Instant createdAt,
                                 String receiptUrl) {
        this.message = message;
        this.orderNumber = orderNumber;
        this.status = status;
        this.totalAmount = totalAmount;
        this.createdAt = createdAt;
        this.receiptUrl = receiptUrl;
    }

    public String getMessage() {
        return message;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public String getReceiptUrl() {
        return receiptUrl;
    }
}
