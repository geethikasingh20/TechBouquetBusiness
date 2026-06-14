package com.techbouquet.order;

import com.techbouquet.cart.CartAddon;
import java.math.BigDecimal;
import java.util.List;

public class OrderItemResponse {
    private final Long id;
    private final Long productId;
    private final String productName;
    private final String productImageUrl;
    private final String deliveryPincode;
    private final BigDecimal unitPrice;
    private final BigDecimal addonTotal;
    private final int quantity;
    private final BigDecimal lineTotal;
    private final List<CartAddon> addons;

    public OrderItemResponse(Long id,
                             Long productId,
                             String productName,
                             String productImageUrl,
                             String deliveryPincode,
                             BigDecimal unitPrice,
                             BigDecimal addonTotal,
                             int quantity,
                             BigDecimal lineTotal,
                             List<CartAddon> addons) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productImageUrl = productImageUrl;
        this.deliveryPincode = deliveryPincode;
        this.unitPrice = unitPrice;
        this.addonTotal = addonTotal;
        this.quantity = quantity;
        this.lineTotal = lineTotal;
        this.addons = addons;
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getProductImageUrl() {
        return productImageUrl;
    }

    public String getDeliveryPincode() {
        return deliveryPincode;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public BigDecimal getAddonTotal() {
        return addonTotal;
    }

    public int getQuantity() {
        return quantity;
    }

    public BigDecimal getLineTotal() {
        return lineTotal;
    }

    public List<CartAddon> getAddons() {
        return addons;
    }
}
