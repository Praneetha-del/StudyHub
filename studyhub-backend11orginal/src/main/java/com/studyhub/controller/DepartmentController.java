package com.studyhub.controller;

import com.studyhub.dto.response.ApiResponse;
import com.studyhub.entity.Department;
import com.studyhub.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentRepository;

    // ✅ PUBLIC endpoint - No auth required
    @GetMapping("/public")
    public ResponseEntity<ApiResponse> getPublicDepartments() {
        List<Department> departments = departmentRepository.findAll();
        return ResponseEntity.ok(
            ApiResponse.success("Departments retrieved successfully", departments, "/api/departments/public")
        );
    }
}