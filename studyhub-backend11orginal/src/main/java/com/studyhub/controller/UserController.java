package com.studyhub.controller;

import com.studyhub.dto.request.ProfileUpdateRequest;
import com.studyhub.dto.response.ApiResponse;
import com.studyhub.dto.response.UserResponse;
import com.studyhub.security.JwtTokenProvider;
import com.studyhub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getProfile(@RequestHeader("Authorization") String token) {
        String userId = getUserIdFromToken(token);
        UserResponse profile = userService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", profile, "/users/profile"));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateProfile(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody ProfileUpdateRequest request) {
        String userId = getUserIdFromToken(token);
        UserResponse updatedProfile = userService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", updatedProfile, "/users/profile"));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(
            @RequestHeader("Authorization") String token,
            @RequestParam String currentPassword,
            @RequestParam String newPassword) {
        String userId = getUserIdFromToken(token);
        userService.changePassword(userId, currentPassword, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null, "/users/change-password"));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse> getUserById(@PathVariable String userId) {
        UserResponse user = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("User retrieved", user, "/users/" + userId));
    }

    private String getUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        // You might need to fetch user by email to get ID
        return email; // or fetch user ID from email
    }
}