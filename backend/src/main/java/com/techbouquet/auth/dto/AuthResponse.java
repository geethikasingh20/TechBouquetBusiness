package com.techbouquet.auth.dto;

public class AuthResponse {
    private String token;
    private String name;
    private boolean emailVerified;

    public AuthResponse(String token, String name, boolean emailVerified) {
        this.token = token;
        this.name = name;
        this.emailVerified = emailVerified;
    }

    public String getToken() {
        return token;
    }

    public String getName() {
        return name;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }
}
