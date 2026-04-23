package com.techbouquet.product;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCase(String name);
    long countByActiveTrue();

    @EntityGraph(attributePaths = "images")
    @Query("select distinct p from Product p where p.active = true")
    List<Product> findAllActiveWithImages();

    @EntityGraph(attributePaths = "images")
    @Query("select p from Product p where p.id = :id and p.active = true")
    Optional<Product> findActiveByIdWithImages(@Param("id") Long id);

    @EntityGraph(attributePaths = "images")
    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name);

    @Query(value = "select p.id as id, p.name as name, p.price as price, p.rating as rating, p.category as category, p.subcategory as subcategory, (select pi.url from product_images pi where pi.product_id = p.id order by pi.sort_order asc limit 1) as imageUrl from products p where p.active = true order by p.id asc", nativeQuery = true)
    List<ProductSummaryView> findProductSummaries();
}
