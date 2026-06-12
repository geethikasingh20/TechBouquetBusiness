package com.techbouquet.address;


import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;


@RestController
@RequestMapping("/api/address")
public class AddressController {
    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @PostMapping
    public AddressResponse saveAddress(
            @RequestBody AddressRequest request,
            Principal principal) {

        return addressService.saveAddress(request, principal);
    }

    @GetMapping("/me")
    public List<AddressResponse> getMyAddresses(Principal principal) {
        return addressService.getAddressesForPrincipal(principal);
    }

    @GetMapping("/{customerId}")
    public List<AddressResponse> getAddresses(
            @PathVariable Long customerId) {

        return addressService.getAddresses(customerId);
    }
}
