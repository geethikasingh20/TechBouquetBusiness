package com.techbouquet.address;


public record AddressResponse(
        Long id,
        String label,
        String recipientName,
        String recipientPhone,
        String line1,
        String line2,
        String line3,
        String city,
        String state,
        String pincode
) {}
