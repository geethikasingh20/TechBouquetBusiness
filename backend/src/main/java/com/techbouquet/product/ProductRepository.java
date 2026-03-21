package com.techbouquet.product;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {
    @EntityGraph(attributePaths = "images")
    @Query("select distinct p from Product p where p.active = true")
    List<Product> findAllActiveWithImages();

    @EntityGraph(attributePaths = "images")
    @Query("select p from Product p where p.id = :id and p.active = true")
    Optional<Product> findActiveByIdWithImages(@Param("id") Long id);

    @EntityGraph(attributePaths = "images")
    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name);
}
