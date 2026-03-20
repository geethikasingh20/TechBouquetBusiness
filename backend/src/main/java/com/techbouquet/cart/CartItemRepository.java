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

    @Query("select c from CartItem c where c.cart = :cart order by c.updatedAt desc, c.id desc")
    List<CartItem> findByCartOrderByUpdatedAtDescIdDesc(@Param("cart") Cart cart);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query(value = "INSERT INTO cart_items (cart_id, product_id, addons_json, quantity, updated_at) " +
            "VALUES (:cartId, :productId, :addonsJson, 1, clock_timestamp()) " +
            "ON CONFLICT (cart_id, product_id, addons_json) " +
            "DO UPDATE SET quantity = cart_items.quantity + 1, updated_at = clock_timestamp()", nativeQuery = true)
    int upsertIncrement(@Param("cartId") Long cartId,
                        @Param("productId") Long productId,
                        @Param("addonsJson") String addonsJson);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query(value = "UPDATE cart_items SET quantity = :quantity, updated_at = clock_timestamp() WHERE id = :id", nativeQuery = true)
    int updateQuantityAndTouch(@Param("id") Long id, @Param("quantity") int quantity);
}
