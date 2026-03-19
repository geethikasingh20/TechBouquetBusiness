package com.techbouquet.customer;

public class CustomerProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private boolean emailVerified;

    public CustomerProfileResponse(Long id, String name, String email, String phoneNumber, boolean emailVerified) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.emailVerified = emailVerified;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }
}
