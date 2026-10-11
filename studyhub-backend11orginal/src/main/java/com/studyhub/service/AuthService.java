package com.studyhub.service;

import com.studyhub.dto.request.LoginRequest;
import com.studyhub.dto.request.RegisterRequest;
import com.studyhub.dto.response.AuthResponse;
import com.studyhub.dto.response.UserResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(String refreshToken);

    void logout(String token);

    UserResponse getCurrentUser(String email);

    void sendVerificationCode(String email);

    void verifyCode(String email, String code);

    void resendVerificationCode(String email);

    void forgotPassword(String email);

    void resetPassword(String token, String newPassword);

    void changePassword(String userId, String currentPassword, String newPassword);
}