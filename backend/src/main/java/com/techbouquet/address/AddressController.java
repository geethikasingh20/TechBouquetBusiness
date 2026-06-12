package com.techbouquet.address;


import org.springframework.http.ResponseEntity;

import com.techbouquet.customer.Customer;
import com.techbouquet.customer.CustomerRepository;




import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/api/address")
public class AddressController {  
        
        private final AddressService addressService;

        public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }
    
    @PostMapping
    public AddressResponse saveAddress(
            @RequestBody AddressRequest request) {

        return addressService.saveAddress(request);
    }

    @GetMapping("/{customerId}")
    public List<AddressResponse> getAddresses(
            @PathVariable Long customerId) {

        return addressService.getAddresses(customerId);
    }
}
