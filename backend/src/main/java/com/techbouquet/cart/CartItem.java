package com.techbouquet.cart;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.techbouquet.product.Product;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "cart_items", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"cart_id", "product_id", "addons_json", "delivery_pincode"})
})
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id")
    private Cart cart;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false)
    private int quantity = 1;

    @Column(name = "addons_json", length = 4000, nullable = false)
    private String addonsJson;

    @Column(name = "delivery_pincode", length = 6, nullable = false)
    private String deliveryPincode = "";

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    private void ensureDefaults() {
        if (addonsJson == null || addonsJson.isBlank()) {
            addonsJson = "[]";
        }
        if (deliveryPincode == null || deliveryPincode.isBlank()) {
            deliveryPincode = "";
        }
        updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
