package com.studyhub.controller;

import com.studyhub.dto.request.CreateQueryRequest;
import com.studyhub.dto.request.ReplyQueryRequest;
import com.studyhub.dto.response.ApiResponse;
import com.studyhub.entity.StudentQuery;
import com.studyhub.entity.User;
import com.studyhub.repository.UserRepository;
import com.studyhub.security.JwtTokenProvider;
import com.studyhub.service.StudentQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/queries")
public class StudentQueryController {

    @Autowired
    private StudentQueryService studentQueryService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    // 1. Student creates a doubt/query
    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN', 'ROLE_STUDENT', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> createQuery(
            @RequestBody CreateQueryRequest request,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User currentUser = getCurrentUser(token);
            StudentQuery createdQuery = studentQueryService.createQuery(currentUser, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Doubt submitted successfully to the subject teacher", createdQuery, "/api/queries"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage(), "/api/queries"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to submit query: " + e.getMessage(), "/api/queries"));
        }
    }

    // 2. Student views their submitted queries
    @GetMapping("/my-queries")
    public ResponseEntity<ApiResponse> getMyQueries(
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User currentUser = getCurrentUser(token);
            List<StudentQuery> queries = studentQueryService.getStudentQueries(currentUser);
            return ResponseEntity.ok(ApiResponse.success("Student queries retrieved", queries, "/api/queries/my-queries"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get student queries: " + e.getMessage(), "/api/queries/my-queries"));
        }
    }

    // 3. Teacher views queries assigned to them / their subjects
    @GetMapping("/teacher-queries")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> getTeacherQueries(
            @RequestParam(value = "status", required = false) String status,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User currentUser = getCurrentUser(token);
            List<StudentQuery> queries = studentQueryService.getTeacherQueries(currentUser, status);
            return ResponseEntity.ok(ApiResponse.success("Teacher queries retrieved", queries, "/api/queries/teacher-queries"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get teacher queries: " + e.getMessage(), "/api/queries/teacher-queries"));
        }
    }

    // 4. View single query details
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getQueryById(
            @PathVariable("id") String id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User currentUser = getCurrentUser(token);
            StudentQuery query = studentQueryService.getQueryById(id, currentUser);
            return ResponseEntity.ok(ApiResponse.success("Query details retrieved", query, "/api/queries/" + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Query not found: " + e.getMessage(), "/api/queries/" + id));
        }
    }

    // 5. Teacher replies to a query
    @PostMapping("/{id}/reply")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> replyToQuery(
            @PathVariable("id") String id,
            @RequestBody ReplyQueryRequest request,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User currentUser = getCurrentUser(token);
            StudentQuery updatedQuery = studentQueryService.replyToQuery(id, currentUser, request);
            return ResponseEntity.ok(ApiResponse.success("Reply submitted successfully", updatedQuery, "/api/queries/" + id + "/reply"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage(), "/api/queries/" + id + "/reply"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to submit reply: " + e.getMessage(), "/api/queries/" + id + "/reply"));
        }
    }

    // 6. Mark query as resolved
    @PutMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse> resolveQuery(
            @PathVariable("id") String id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User currentUser = getCurrentUser(token);
            StudentQuery resolvedQuery = studentQueryService.resolveQuery(id, currentUser);
            return ResponseEntity.ok(ApiResponse.success("Query marked as resolved", resolvedQuery, "/api/queries/" + id + "/resolve"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to resolve query: " + e.getMessage(), "/api/queries/" + id + "/resolve"));
        }
    }

    // 7. Auto-identify teachers for a subject
    @GetMapping("/teachers-by-subject")
    public ResponseEntity<ApiResponse> getTeachersForSubject(
            @RequestParam(value = "subjectName", required = false) String subjectName,
            @RequestParam(value = "subjectId", required = false) String subjectId,
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "departmentId", required = false) String departmentId) {
        try {
            Map<String, Object> teachers = studentQueryService.getTeachersForSubject(subjectName, subjectId, department, departmentId);
            return ResponseEntity.ok(ApiResponse.success("Teachers retrieved for subject", teachers, "/api/queries/teachers-by-subject"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get teachers: " + e.getMessage(), "/api/queries/teachers-by-subject"));
        }
    }

    // 8. Stats for counts / dashboard widgets
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getQueryStats(
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            User currentUser = getCurrentUser(token);
            Map<String, Object> stats = studentQueryService.getQueryStats(currentUser);
            return ResponseEntity.ok(ApiResponse.success("Query statistics retrieved", stats, "/api/queries/stats"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get stats: " + e.getMessage(), "/api/queries/stats"));
        }
    }

    private User getCurrentUser(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new RuntimeException("Authorization token is required");
        }
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
}
