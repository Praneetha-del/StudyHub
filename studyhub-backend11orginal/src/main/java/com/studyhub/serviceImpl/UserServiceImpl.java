package com.studyhub.serviceImpl;

import com.studyhub.dto.request.ProfileUpdateRequest;
import com.studyhub.dto.response.UserResponse;
import com.studyhub.entity.User;
import com.studyhub.exception.ResourceNotFoundException;
import com.studyhub.repository.UserRepository;
import com.studyhub.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserResponse getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return convertToResponse(user);
    }

    @Override
    public UserResponse updateProfile(String userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Update fields
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment());
        }
        if (request.getDepartmentId() != null) {
            user.setDepartmentId(request.getDepartmentId());
        }
        if (request.getRollNumber() != null) {
            user.setRollNumber(request.getRollNumber());
        }
        if (request.getEmployeeId() != null) {
            user.setEmployeeId(request.getEmployeeId());
        }
        if (request.getBranch() != null) {
            user.setBranch(request.getBranch());
        }
        if (request.getYear() != null) {
            user.setYear(request.getYear());
        }
        if (request.getSemester() != null) {
            user.setSemester(request.getSemester());
        }
        if (request.getJoiningYear() != null) {
            user.setJoiningYear(request.getJoiningYear());
        }

        user.setUpdatedAt(LocalDateTime.now());
        
        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }

    @Override
    public void changePassword(String userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Override
    public UserResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return convertToResponse(user);
    }

    private UserResponse convertToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setDepartment(user.getDepartment());
        response.setDepartmentId(user.getDepartmentId());
        response.setRollNumber(user.getRollNumber());
        response.setEmployeeId(user.getEmployeeId());
        response.setBranch(user.getBranch());
        response.setYear(user.getYear());
        response.setSemester(user.getSemester());
        response.setJoiningYear(user.getJoiningYear());
        response.setProfilePicture(user.getProfilePicture());
        response.setStatus(user.getStatus());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}