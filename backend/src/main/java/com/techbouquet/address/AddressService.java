package com.techbouquet.address;

import com.techbouquet.customer.Customer;
import com.techbouquet.customer.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@Service
public class AddressService {
    private final CustomerRepository customerRepository;
    private final AddressRepository addressRepository;

    public AddressService(CustomerRepository customerRepository, AddressRepository addressRepository) {
        this.customerRepository = customerRepository;
        this.addressRepository = addressRepository;
    }

    public AddressResponse saveAddress(AddressRequest request, Principal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        Customer customer = customerRepository.findByEmail(principal.getName())
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        String label = request.label() == null ? "" : request.label().trim();
        if (label.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Address label is required");
        }
        if (addressRepository.existsByCustomerIdAndLabel(customer.getId(), label)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Address label must be unique");
        }

        Address address = new Address();

        address.setCustomer(customer);
        address.setLabel(label);

        address.setRecipientName(request.recipientName());
        address.setPhone(request.recipientPhone());

        address.setAddressLine1(request.line1());
        address.setAddressLine2(request.line2());
        address.setLandmark(request.line3());
        address.setCity(request.city());
        address.setState(request.state());

        address.setPincode(request.pincode());

        Address saved = addressRepository.save(address);

        return mapToResponse(saved);
    }

    public List<AddressResponse> getAddresses(Long customerId) {

        List<AddressResponse> add= addressRepository.findByCustomerId(customerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
         for(AddressResponse a: add){
            System.out.println(a.label() + " --- " + a.recipientName());
         }       
        return add;
    }

    public List<AddressResponse> getAddressesForPrincipal(Principal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        Customer customer = customerRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return getAddresses(customer.getId());
    }

    private AddressResponse mapToResponse(Address address) {

        return new AddressResponse(
                address.getId(),
                address.getLabel(),
                address.getRecipientName(),
                address.getPhone(),
                address.getAddressLine1(),
                address.getAddressLine2(),
                address.getLandmark(),
                address.getCity(),
                address.getState(),
                address.getPincode()
        );
    }
}
