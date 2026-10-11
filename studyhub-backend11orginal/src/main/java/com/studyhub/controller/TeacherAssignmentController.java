package com.studyhub.controller;

import com.studyhub.dto.request.TeacherAssignmentRequest;
import com.studyhub.dto.response.ApiResponse;
import com.studyhub.entity.TeacherAssignment;
import com.studyhub.entity.User;
import com.studyhub.exception.ResourceNotFoundException;
import com.studyhub.repository.UserRepository;
import com.studyhub.security.JwtTokenProvider;
import com.studyhub.service.TeacherAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TeacherAssignmentController {

    @Autowired
    private TeacherAssignmentService teacherAssignmentService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    // ==================== ADMIN ENDPOINTS ====================

    @GetMapping("/admin/teacher-assignments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAllAssignments(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String departmentId) {

        List<TeacherAssignment> list;
        if (teacherId != null && !teacherId.trim().isEmpty()) {
            list = teacherAssignmentService.getAssignmentsByTeacher(teacherId);
        } else if (departmentId != null && !departmentId.trim().isEmpty()) {
            list = teacherAssignmentService.getAssignmentsByDepartment(departmentId);
        } else {
            list = teacherAssignmentService.getAllAssignments();
        }

        return ResponseEntity.ok(ApiResponse.success("Teacher assignments retrieved", list, "/api/admin/teacher-assignments"));
    }

    @PostMapping("/admin/teacher-assignments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> createAssignment(@RequestBody TeacherAssignmentRequest request) {
        TeacherAssignment created = teacherAssignmentService.createOrUpdateAssignment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Teacher assigned successfully", created, "/api/admin/teacher-assignments"));
    }

    @DeleteMapping("/admin/teacher-assignments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteAssignment(@PathVariable String id) {
        teacherAssignmentService.deleteAssignment(id);
        return ResponseEntity.ok(ApiResponse.success("Teacher assignment removed", null, "/api/admin/teacher-assignments/" + id));
    }

    // ==================== TEACHER ENDPOINTS ====================

    @GetMapping("/teacher/assignments")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getMyAssignments(
            @RequestHeader(value = "Authorization", required = false) String token) {
        String userId = getUserIdFromToken(token);
        List<TeacherAssignment> list = teacherAssignmentService.getAssignmentsByTeacher(userId);
        return ResponseEntity.ok(ApiResponse.success("Your teaching assignments retrieved", list, "/api/teacher/assignments"));
    }

    @GetMapping("/teacher/assigned-departments")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getMyAssignedDepartments(
            @RequestHeader(value = "Authorization", required = false) String token) {
        String userId = getUserIdFromToken(token);
        List<Map<String, String>> departments = teacherAssignmentService.getTeacherAssignedDepartments(userId);
        return ResponseEntity.ok(ApiResponse.success("Assigned departments retrieved", departments, "/api/teacher/assigned-departments"));
    }

    // ==================== PUBLIC / STUDENT LOOKUP ====================

    @GetMapping("/curriculum/teachers-for-subject")
    public ResponseEntity<ApiResponse> getTeachersForCurriculum(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String subjectId,
            @RequestParam(required = false) Integer academicYear,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String regulation) {

        List<Map<String, Object>> teachers = teacherAssignmentService.getTeachersForSubjectCurriculum(
                department, departmentId, subject, subjectId, academicYear, semester, regulation
        );

        TeacherAssignment assigned = teacherAssignmentService.findAssignedTeacherForCurriculum(
                department, departmentId, subject, subjectId, academicYear, semester, regulation
        );

        return ResponseEntity.ok(ApiResponse.success("Teachers for subject retrieved", Map.of(
                "assignedTeacher", assigned != null ? assigned : Map.of(),
                "availableTeachers", teachers
        ), "/api/curriculum/teachers-for-subject"));
    }

    private String getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization token missing or invalid");
        }
        String token = authHeader.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            throw new RuntimeException("Invalid token");
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for token"));
        return user.getId();
    }
}
