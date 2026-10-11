package com.studyhub.serviceImpl;

import com.studyhub.dto.request.LoginRequest;
import com.studyhub.dto.request.RegisterRequest;
import com.studyhub.dto.response.AuthResponse;
import com.studyhub.dto.response.UserResponse;
import com.studyhub.entity.User;
import com.studyhub.entity.VerificationCode;
import com.studyhub.exception.DuplicateResourceException;
import com.studyhub.exception.UnauthorizedException;
import com.studyhub.repository.UserRepository;
import com.studyhub.repository.VerificationCodeRepository;
import com.studyhub.security.JwtTokenProvider;
import com.studyhub.service.AuthService;
import com.studyhub.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Collections;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VerificationCodeRepository verificationCodeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private EmailService emailService;

    private final SecureRandom random = new SecureRandom();

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        if (request.getRollNumber() != null && !request.getRollNumber().isEmpty()) {
            if (userRepository.existsByRollNumber(request.getRollNumber())) {
                throw new DuplicateResourceException("Roll number already registered: " + request.getRollNumber());
            }
        }

        if (request.getEmployeeId() != null && !request.getEmployeeId().isEmpty()) {
            if (userRepository.existsByEmployeeId(request.getEmployeeId())) {
                throw new DuplicateResourceException("Employee ID already registered: " + request.getEmployeeId());
            }
        }

        String role = request.getRole();
        if (role == null || role.isEmpty()) {
            role = "ROLE_STUDENT";
        } else if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role.toUpperCase();
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setDepartment(request.getDepartment());
        user.setDepartmentId(request.getDepartmentId());
        user.setRollNumber(request.getRollNumber());
        user.setEmployeeId(request.getEmployeeId());
        user.setBranch(request.getBranch());
        user.setYear(request.getYear());
        user.setSemester(request.getSemester());
        user.setJoiningYear(request.getJoiningYear());

        if ("ROLE_ADMIN".equals(role)) {
            user.setStatus("ACTIVE");
            user.setActive(true);
        } else {
            user.setStatus("PENDING");
            user.setActive(false);
        }

        User savedUser = userRepository.save(user);

        String code = String.format("%06d", random.nextInt(1000000));
        System.out.println("📧 OTP for " + request.getEmail() + ": " + code);

        verificationCodeRepository.deleteByEmail(request.getEmail());

        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setEmail(request.getEmail());
        verificationCode.setCode(code);
        verificationCode.setRole(role);
        verificationCode.setFirstName(request.getFirstName());
        verificationCode.setLastName(request.getLastName());
        verificationCode.setPassword(request.getPassword());
        verificationCode.setRollNumber(request.getRollNumber());
        verificationCode.setEmployeeId(request.getEmployeeId());
        verificationCode.setBranch(request.getBranch());
        verificationCode.setDepartment(request.getDepartment() != null ? request.getDepartment() : "IT");
        verificationCode.setYear(request.getYear());
        verificationCode.setSemester(request.getSemester());
        verificationCode.setJoiningYear(request.getJoiningYear());
        verificationCode.setExpiryDate(LocalDateTime.now().plusMinutes(5));
        verificationCode.setCreatedAt(LocalDateTime.now());
        verificationCode.setVerified(false);

        verificationCodeRepository.save(verificationCode);

        try {
            emailService.sendVerificationEmail(request.getEmail(), code, request.getFirstName());
        } catch (Exception e) {
            System.out.println("📱 Use OTP from console: " + code);
        }

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);

        if ("ROLE_ADMIN".equals(role)) {
            response.setMessage("Admin registration successful. Please verify your email.");
            response.setTokenType("ADMIN_VERIFICATION");
        } else {
            response.setMessage("Registration successful. Please verify your email.");
            response.setTokenType("PENDING");
        }

        response.setUser(convertToUserResponse(savedUser));
        return response;
    }

    // ✅ COMPLETE FIXED LOGIN
   // In AuthServiceImpl.java - Add role validation in login method

@Override
public AuthResponse login(LoginRequest request) {
    try {
        String username = request.getUsername();
        String password = request.getPassword();
        String requestedRole = request.getRole(); // Add this field

        System.out.println("========================================");
        System.out.println("🔑 LOGIN ATTEMPT");
        System.out.println("  Username: " + username);
        System.out.println("  Requested Role: " + requestedRole);
        System.out.println("========================================");

        User user = null;

        // Find user by email, employee ID, or roll number
        if (username.contains("@")) {
            user = userRepository.findByEmail(username).orElse(null);
        }
        if (user == null) {
            user = userRepository.findByEmployeeId(username).orElse(null);
        }
        if (user == null) {
            user = userRepository.findByRollNumber(username).orElse(null);
        }

        if (user == null) {
            throw new UnauthorizedException("Invalid username or password");
        }

        // ✅ NEW: Validate role matches requested role
        if (requestedRole != null && !requestedRole.isEmpty()) {
            String userRole = user.getRole();
            String requested = requestedRole.toUpperCase();
            
            // Handle both "ROLE_ADMIN" and "ADMIN" formats
            boolean roleMatches = userRole.equals(requested) || 
                                 userRole.equals("ROLE_" + requested) ||
                                 userRole.replace("ROLE_", "").equals(requested);
            
            if (!roleMatches) {
                String roleName = requested.replace("ROLE_", "");
                throw new UnauthorizedException("You are not registered as a " + roleName + 
                                               ". Please select your correct role.");
            }
            System.out.println("✅ Role validation passed: " + userRole);
        }

        // Check status
        if (!"ACTIVE".equals(user.getStatus())) {
            String message;
            if ("PENDING".equals(user.getStatus())) {
                message = "Your account is pending admin approval.";
            } else if ("REJECTED".equals(user.getStatus())) {
                message = "Your account has been rejected.";
            } else {
                message = "Your account is not active.";
            }
            throw new UnauthorizedException(message);
        }

        if (!user.isActive()) {
            throw new UnauthorizedException("Your account is disabled.");
        }

        // Verify password
        boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());
        if (!passwordMatches) {
            throw new UnauthorizedException("Invalid username or password");
        }

        // Authenticate with Spring Security
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(user.getEmail(), password)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = jwtTokenProvider.generateToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Login successful");
        response.setToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setTokenType("Bearer");
        response.setUser(convertToUserResponse(user));

        return response;

    } catch (Exception e) {
        System.err.println("❌ Login error: " + e.getMessage());
        e.printStackTrace();
        throw new UnauthorizedException(e.getMessage());
    }
}


    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        Authentication authentication = new UsernamePasswordAuthenticationToken(
            user.getEmail(),
            null,
            Collections.singletonList(new SimpleGrantedAuthority(user.getRole()))
        );

        String newAccessToken = jwtTokenProvider.generateToken(authentication);

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Token refreshed");
        response.setToken(newAccessToken);
        response.setRefreshToken(refreshToken);
        response.setTokenType("Bearer");
        response.setUser(convertToUserResponse(user));
        return response;
    }

    @Override
    public void logout(String token) {
        SecurityContextHolder.clearContext();
    }

    @Override
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return convertToUserResponse(user);
    }

    @Override
    public void sendVerificationCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        String code = String.format("%06d", random.nextInt(1000000));
        verificationCodeRepository.deleteByEmail(email);

        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setEmail(email);
        verificationCode.setCode(code);
        verificationCode.setRole(user.getRole());
        verificationCode.setExpiryDate(LocalDateTime.now().plusMinutes(5));
        verificationCode.setCreatedAt(LocalDateTime.now());
        verificationCode.setVerified(false);
        verificationCodeRepository.save(verificationCode);

        try {
            emailService.sendVerificationEmail(email, code, user.getFirstName());
        } catch (Exception e) {
            System.err.println("❌ Failed to send OTP email: " + e.getMessage());
        }
    }

    @Override
    public void verifyCode(String email, String code) {
        VerificationCode verificationCode = verificationCodeRepository
                .findByEmailAndCodeAndVerifiedFalse(email, code)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired verification code"));

        if (verificationCode.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Verification code has expired");
        }

        verificationCode.setVerified(true);
        verificationCodeRepository.save(verificationCode);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if ("ROLE_ADMIN".equals(user.getRole())) {
            user.setStatus("ACTIVE");
            user.setActive(true);
        } else {
            user.setStatus("PENDING");
            user.setActive(false);
        }

        userRepository.save(user);
    }

    @Override
    public void resendVerificationCode(String email) {
        sendVerificationCode(email);
    }

    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        String code = String.format("%06d", random.nextInt(1000000));

        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setEmail(email);
        verificationCode.setCode(code);
        verificationCode.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        verificationCode.setCreatedAt(LocalDateTime.now());
        verificationCode.setVerified(false);
        verificationCodeRepository.save(verificationCode);

        try {
            emailService.sendVerificationEmail(email, code, user.getFirstName());
        } catch (Exception e) {
            System.err.println("❌ Failed to send reset email: " + e.getMessage());
        }
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        System.out.println("Reset password with token: " + token);
    }

    @Override
    public void changePassword(String userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRollNumber(user.getRollNumber());
        response.setEmployeeId(user.getEmployeeId());
        response.setRole(user.getRole());
        response.setDepartment(user.getDepartment());
        response.setDepartmentId(user.getDepartmentId());
        response.setBranch(user.getBranch());
        response.setYear(user.getYear());
        response.setSemester(user.getSemester());
        response.setJoiningYear(user.getJoiningYear());
        response.setProfilePicture(user.getProfilePicture());
        response.setActive(user.isActive());
        response.setStatus(user.getStatus());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}