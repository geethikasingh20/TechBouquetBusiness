package com.techbouquet.address;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;


public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByCustomerId(Long customerId);
    java.util.Optional<Address> findByIdAndCustomerId(Long id, Long customerId);
    boolean existsByCustomerIdAndLabel(Long customerId, String label);
    boolean existsByCustomerIdAndLabelAndIdNot(Long customerId, String label, Long id);

}

