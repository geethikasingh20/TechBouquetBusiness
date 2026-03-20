package com.techbouquet.cart;

import com.techbouquet.product.Product;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartAndProductAndAddonsJson(Cart cart, Product product, String addonsJson);
    Optional<CartItem> findByCartAndProductAndAddonsJsonIsNull(Cart cart, Product product);
    List<CartItem> findByCart(Cart cart);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO cart_items (cart_id, product_id, addons_json, quantity) " +
            "VALUES (:cartId, :productId, :addonsJson, 1) " +
            "ON CONFLICT (cart_id, product_id, addons_json) " +
            "DO UPDATE SET quantity = cart_items.quantity + 1", nativeQuery = true)
    int upsertIncrement(@Param("cartId") Long cartId,
                        @Param("productId") Long productId,
                        @Param("addonsJson") String addonsJson);
}
