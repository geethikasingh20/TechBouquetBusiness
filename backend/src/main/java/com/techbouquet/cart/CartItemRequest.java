package com.techbouquet.cart;

public class CartItemRequest {
    private Long productId;
    private String addonsJson;
    private String deliveryPincode;

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getAddonsJson() {
        return addonsJson;
    }

    public void setAddonsJson(String addonsJson) {
        this.addonsJson = addonsJson;
    }

    public String getDeliveryPincode() {
        return deliveryPincode;
    }

    public void setDeliveryPincode(String deliveryPincode) {
        this.deliveryPincode = deliveryPincode;
    }
}
