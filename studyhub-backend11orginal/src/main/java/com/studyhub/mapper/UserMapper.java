package com.studyhub.mapper;

import com.studyhub.dto.response.UserResponse;
import com.studyhub.entity.User;

public class UserMapper {

    public static UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        
        // Department fields
        response.setDepartment(user.getDepartment());
        response.setDepartmentId(user.getDepartmentId());
        
        response.setRollNumber(user.getRollNumber());
        response.setEmployeeId(user.getEmployeeId());
        response.setBranch(user.getBranch());
        response.setYear(user.getYear());
        response.setSemester(user.getSemester());
        response.setJoiningYear(user.getJoiningYear());
        response.setProfilePicture(user.getProfilePicture());
        
        // ✅ Use getActive() instead of isActive()
        response.setActive(user.getActive());
        response.setStatus(user.getStatus());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        
        return response;
    }

    public static User toEntity(UserResponse response) {
        if (response == null) {
            return null;
        }

        User user = new User();
        user.setId(response.getId());
        user.setFirstName(response.getFirstName());
        user.setLastName(response.getLastName());
        user.setEmail(response.getEmail());
        user.setRole(response.getRole());
        
        // Department fields
        user.setDepartment(response.getDepartment());
        user.setDepartmentId(response.getDepartmentId());
        
        user.setRollNumber(response.getRollNumber());
        user.setEmployeeId(response.getEmployeeId());
        user.setBranch(response.getBranch());
        user.setYear(response.getYear());
        user.setSemester(response.getSemester());
        user.setJoiningYear(response.getJoiningYear());
        user.setProfilePicture(response.getProfilePicture());
        
        user.setActive(response.getActive());
        user.setStatus(response.getStatus());
        user.setCreatedAt(response.getCreatedAt());
        user.setUpdatedAt(response.getUpdatedAt());
        
        return user;
    }
}