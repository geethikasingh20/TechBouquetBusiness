package com.techbouquet.address;

import com.techbouquet.customer.Customer;
import com.techbouquet.customer.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {
    private final CustomerRepository customerRepository;
    private final AddressRepository addressRepository;

    public AddressService(CustomerRepository customerRepository, AddressRepository addressRepository) {
        this.customerRepository = customerRepository;
        this.addressRepository = addressRepository;
    }

    public AddressResponse saveAddress(AddressRequest request) {

        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        Address address = new Address();

        address.setCustomer(customer);
        address.setLabel(request.label());

        address.setRecipientName(request.recipientName());
        address.setPhone(request.recipientPhone());

        address.setAddressLine1(request.line1());
        address.setAddressLine2(request.line2());
        address.setLandmark(request.line3());

        address.setPincode(request.pincode());

        Address saved = addressRepository.save(address);

        return mapToResponse(saved);
    }

    public List<AddressResponse> getAddresses(Long customerId) {

        return addressRepository.findByCustomerId(customerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
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
                address.getPincode()
        );
    }
}