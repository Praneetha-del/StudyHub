package com.studyhub.controller;

import com.studyhub.dto.request.LoginRequest;
import com.studyhub.dto.request.RegisterRequest;
import com.studyhub.dto.request.VerifyCodeRequest;
import com.studyhub.dto.response.ApiResponse;
import com.studyhub.dto.response.AuthResponse;
import com.studyhub.dto.response.UserResponse;
import com.studyhub.security.JwtTokenProvider;
import com.studyhub.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            System.out.println("🔑 Login attempt: " + request.getUsername());
            AuthResponse authResponse = authService.login(request);
            return ResponseEntity.ok(
                ApiResponse.success("Login successful", authResponse, "/api/auth/login")
            );
        } catch (Exception e) {
            System.err.println("❌ Login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage(), "/api/auth/login"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response.getMessage(), response, "/api/auth/register"));
    }

// Keep both endpoints for backward compatibility

// ✅ For query parameters (existing)
@PostMapping("/verify")
public ResponseEntity<ApiResponse> verifyCode(
        @RequestParam String email,
        @RequestParam String code) {
    authService.verifyCode(email, code);
    return ResponseEntity.ok(ApiResponse.success("Email verified successfully", null, "/api/auth/verify"));
}

// ✅ For JSON body (already exists)
@PostMapping("/verify/otp")
public ResponseEntity<ApiResponse> verifyOTP(@Valid @RequestBody VerifyCodeRequest request) {
    authService.verifyCode(request.getEmail(), request.getCode());
    return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", null, "/api/auth/verify/otp"));
}

    @PostMapping("/send-verification")
    public ResponseEntity<ApiResponse> sendVerification(@RequestParam String email) {
        authService.sendVerificationCode(email);
        return ResponseEntity.ok(ApiResponse.success("Verification code sent", null, "/api/auth/send-verification"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            if (token == null || token.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("No token provided", "/api/auth/me"));
            }
            String email = jwtTokenProvider.getEmailFromToken(token);
            UserResponse user = authService.getCurrentUser(email);
            return ResponseEntity.ok(ApiResponse.success("User profile", user, "/api/auth/me"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: " + e.getMessage(), "/api/auth/me"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        authService.logout(token);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null, "/api/auth/logout"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse> refreshToken(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        AuthResponse response = authService.refreshToken(token);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response, "/api/auth/refresh"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@RequestParam String email) {
        authService.forgotPassword(email);
        return ResponseEntity.ok(ApiResponse.success("Password reset link sent", null, "/api/auth/forgot-password"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {
        authService.resetPassword(token, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null, "/api/auth/reset-password"));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse> resendVerification(@RequestParam String email) {
        authService.resendVerificationCode(email);
        return ResponseEntity.ok(ApiResponse.success("Verification code resent", null, "/api/auth/resend-verification"));
    }
}