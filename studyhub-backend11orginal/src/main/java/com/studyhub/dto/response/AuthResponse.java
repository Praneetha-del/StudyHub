package com.studyhub.dto.response;

public class AuthResponse {

    private boolean success;
    private String message;
    private String token;
    private String refreshToken;
    private String tokenType;
    private UserResponse user;

    public AuthResponse() {}

    public AuthResponse(String token, String refreshToken, String tokenType, UserResponse user) {
        this.success = true;
        this.message = "Login successful";
        this.token = token;
        this.refreshToken = refreshToken;
        this.tokenType = tokenType;
        this.user = user;
    }

    // Getters
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public String getToken() { return token; }
    public String getRefreshToken() { return refreshToken; }
    public String getTokenType() { return tokenType; }
    public UserResponse getUser() { return user; }

    // Setters
    public void setSuccess(boolean success) { this.success = success; }
    public void setMessage(String message) { this.message = message; }
    public void setToken(String token) { this.token = token; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public void setUser(UserResponse user) { this.user = user; }
}