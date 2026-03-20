package com.techbouquet.cart;

import java.util.List;

public class CartItemResponse {
    private Long id;
    private Long productId;
    private String name;
    private int price;
    private int quantity;
    private List<CartAddon> addons;
    private String imageUrl;

    public CartItemResponse(Long id, Long productId, String name, int price, int quantity, List<CartAddon> addons, String imageUrl) {
        this.id = id;
        this.productId = productId;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.addons = addons;
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public String getName() {
        return name;
    }

    public int getPrice() {
        return price;
    }

    public int getQuantity() {
        return quantity;
    }

    public List<CartAddon> getAddons() {
        return addons;
    }

    public String getImageUrl() {
        return imageUrl;
    }
}
