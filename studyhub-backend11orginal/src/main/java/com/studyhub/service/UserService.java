package com.studyhub.service;

import com.studyhub.dto.request.ProfileUpdateRequest;
import com.studyhub.dto.response.UserResponse;

public interface UserService {
    
    UserResponse getProfile(String userId);
    UserResponse updateProfile(String userId, ProfileUpdateRequest request);
    void changePassword(String userId, String currentPassword, String newPassword);
    UserResponse getUserById(String userId);
}