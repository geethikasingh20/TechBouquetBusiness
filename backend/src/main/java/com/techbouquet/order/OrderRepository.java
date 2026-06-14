package com.techbouquet.order;

import com.techbouquet.customer.Customer;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
    boolean existsByOrderNumber(String orderNumber);

    @EntityGraph(attributePaths = {"items"})
    List<Order> findByCustomerOrderByCreatedAtDesc(Customer customer);

    @EntityGraph(attributePaths = {"items"})
    Optional<Order> findByOrderNumber(String orderNumber);

    @EntityGraph(attributePaths = {"items"})
    Optional<Order> findByOrderNumberAndCustomer(String orderNumber, Customer customer);
}
