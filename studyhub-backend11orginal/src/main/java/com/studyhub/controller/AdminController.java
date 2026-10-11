package com.studyhub.controller;

import com.studyhub.dto.request.CurriculumRequest;
import com.studyhub.dto.request.SubjectRequest;
import com.studyhub.dto.response.AdminStatsResponse;
import com.studyhub.dto.response.ApiResponse;
import com.studyhub.dto.response.UserResponse;
import com.studyhub.entity.Curriculum;
import com.studyhub.entity.Department;
import com.studyhub.entity.Regulation;
import com.studyhub.entity.Subject;
import com.studyhub.entity.User;
import com.studyhub.exception.ResourceNotFoundException;
import com.studyhub.repository.UserRepository;
import com.studyhub.service.AdminService;
import com.studyhub.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // ==================== STATS ====================
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getStats(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String departmentId) {
        AdminStatsResponse stats = adminService.getStats(department, departmentId);
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved", stats, "/api/admin/stats"));
    }

    // ==================== USERS ====================
    @GetMapping("/users")
    public ResponseEntity<ApiResponse> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<UserResponse> users = adminService.getAllUsers(role, search, page, size);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users, "/api/admin/users"));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse> getUserById(@PathVariable String id) {
        UserResponse user = adminService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User retrieved", user, "/api/admin/users/" + id));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse> updateUser(
            @PathVariable String id,
            @RequestBody Map<String, Object> updates) {
        UserResponse user = adminService.updateUser(id, updates);
        return ResponseEntity.ok(ApiResponse.success("User updated", user, "/api/admin/users/" + id));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable String id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null, "/api/admin/users/" + id));
    }

    // ✅ FIXED: Approve User with Email
    @PutMapping("/users/{id}/approve")
    public ResponseEntity<ApiResponse> approveUser(@PathVariable String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setStatus("ACTIVE");
        user.setActive(true);
        user.setApprovedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        // ✅ SEND APPROVAL EMAIL
        try {
            emailService.sendAccountApprovalEmail(user.getEmail(), user.getFirstName(), user.getRole());
            System.out.println("✅ Approval email sent to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("❌ Failed to send approval email: " + e.getMessage());
        }
        
        return ResponseEntity.ok(ApiResponse.success("User approved and email sent", null, "/api/admin/users/" + id + "/approve"));
    }

    // ✅ FIXED: Reject User with Email
    @PutMapping("/users/{id}/reject")
    public ResponseEntity<ApiResponse> rejectUser(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "Not specified";
        user.setStatus("REJECTED");
        user.setActive(false);
        user.setRejectionReason(reason);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        // ✅ SEND REJECTION EMAIL
        try {
            emailService.sendAccountRejectionEmail(user.getEmail(), user.getFirstName(), reason);
            System.out.println("✅ Rejection email sent to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("❌ Failed to send rejection email: " + e.getMessage());
        }
        
        return ResponseEntity.ok(ApiResponse.success("User rejected and email sent", null, "/api/admin/users/" + id + "/reject"));
    }

    // ==================== TEACHERS ====================
    @GetMapping("/teachers/pending")
    public ResponseEntity<ApiResponse> getPendingTeachers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<UserResponse> teachers = adminService.getPendingTeachers(page, size);
        return ResponseEntity.ok(ApiResponse.success("Pending teachers retrieved", teachers, "/api/admin/teachers/pending"));
    }

    // ✅ FIXED: Approve Teacher with Email
    @PutMapping("/teachers/{id}/approve")
    public ResponseEntity<ApiResponse> approveTeacher(@PathVariable String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        
        user.setStatus("ACTIVE");
        user.setActive(true);
        user.setApprovedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        // ✅ SEND TEACHER APPROVAL EMAIL
        try {
            emailService.sendTeacherApprovalEmail(user.getEmail(), user.getFirstName());
            System.out.println("✅ Teacher approval email sent to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("❌ Failed to send teacher approval email: " + e.getMessage());
        }
        
        return ResponseEntity.ok(ApiResponse.success("Teacher approved and email sent", null, "/api/admin/teachers/" + id + "/approve"));
    }

    // ✅ FIXED: Reject Teacher with Email
    @PutMapping("/teachers/{id}/reject")
    public ResponseEntity<ApiResponse> rejectTeacher(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        
        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "Not specified";
        user.setStatus("REJECTED");
        user.setActive(false);
        user.setRejectionReason(reason);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        // ✅ SEND TEACHER REJECTION EMAIL
        try {
            emailService.sendTeacherRejectionEmail(user.getEmail(), user.getFirstName(), reason);
            System.out.println("✅ Teacher rejection email sent to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("❌ Failed to send teacher rejection email: " + e.getMessage());
        }
        
        return ResponseEntity.ok(ApiResponse.success("Teacher rejected and email sent", null, "/api/admin/teachers/" + id + "/reject"));
    }

    // ==================== MATERIALS ====================
    @GetMapping("/materials")
    public ResponseEntity<ApiResponse> getAllMaterials(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Map<String, Object>> materials = adminService.getAllMaterialsForAdmin(department, departmentId, status, search, page, size);
        return ResponseEntity.ok(ApiResponse.success("Materials retrieved", materials, "/api/admin/materials"));
    }

    @PutMapping("/materials/{id}/block")
    public ResponseEntity<ApiResponse> blockMaterial(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "Blocked by admin";
        adminService.blockMaterial(id, "admin", reason);
        return ResponseEntity.ok(ApiResponse.success("Material blocked", null, "/api/admin/materials/" + id + "/block"));
    }

    @PutMapping("/materials/{id}/unblock")
    public ResponseEntity<ApiResponse> unblockMaterial(@PathVariable String id) {
        adminService.unblockMaterial(id, "admin");
        return ResponseEntity.ok(ApiResponse.success("Material unblocked", null, "/api/admin/materials/" + id + "/unblock"));
    }

    // ==================== REGULATIONS ====================
    @GetMapping("/regulations")
    public ResponseEntity<ApiResponse> getRegulations() {
        List<Regulation> regulations = adminService.getAllRegulations();
        return ResponseEntity.ok(ApiResponse.success("Regulations retrieved", regulations, "/api/admin/regulations"));
    }

    @PostMapping("/regulations")
    public ResponseEntity<ApiResponse> createRegulation(@RequestBody Regulation regulation) {
        Regulation created = adminService.createRegulation(regulation);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Regulation created", created, "/api/admin/regulations"));
    }

    @PutMapping("/regulations/{id}")
    public ResponseEntity<ApiResponse> updateRegulation(
            @PathVariable String id,
            @RequestBody Regulation regulation) {
        Regulation updated = adminService.updateRegulation(id, regulation);
        return ResponseEntity.ok(ApiResponse.success("Regulation updated", updated, "/api/admin/regulations/" + id));
    }

    @DeleteMapping("/regulations/{id}")
    public ResponseEntity<ApiResponse> deleteRegulation(@PathVariable String id) {
        adminService.deleteRegulation(id);
        return ResponseEntity.ok(ApiResponse.success("Regulation deleted", null, "/api/admin/regulations/" + id));
    }

    // ==================== DEPARTMENTS ====================
    @GetMapping("/departments")
    public ResponseEntity<ApiResponse> getDepartments() {
        List<Department> departments = adminService.getAllDepartments();
        return ResponseEntity.ok(ApiResponse.success("Departments retrieved", departments, "/api/admin/departments"));
    }

    @PostMapping("/departments")
    public ResponseEntity<ApiResponse> createDepartment(@RequestBody Department department) {
        Department created = adminService.createDepartment(department);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Department created", created, "/api/admin/departments"));
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<ApiResponse> updateDepartment(
            @PathVariable String id,
            @RequestBody Department department) {
        Department updated = adminService.updateDepartment(id, department);
        return ResponseEntity.ok(ApiResponse.success("Department updated", updated, "/api/admin/departments/" + id));
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<ApiResponse> deleteDepartment(@PathVariable String id) {
        adminService.deleteDepartment(id);
        return ResponseEntity.ok(ApiResponse.success("Department deleted", null, "/api/admin/departments/" + id));
    }

    // ==================== SUBJECTS ====================
    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse> getSubjects(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String departmentId) {
        String deptToSearch = departmentId != null && !departmentId.isEmpty() ? departmentId : department;
        List<Subject> subjects;
        if (deptToSearch != null && !deptToSearch.isEmpty()) {
            subjects = adminService.getSubjectsByDepartment(deptToSearch);
        } else {
            subjects = adminService.getAllSubjects();
        }
        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved", subjects, "/api/admin/subjects"));
    }

    @PostMapping("/subjects")
    public ResponseEntity<ApiResponse> createSubject(@RequestBody SubjectRequest request) {
        Subject created = adminService.createSubject(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subject created", created, "/api/admin/subjects"));
    }

    @PutMapping("/subjects/{id}")
    public ResponseEntity<ApiResponse> updateSubject(
            @PathVariable String id,
            @RequestBody SubjectRequest request) {
        Subject updated = adminService.updateSubject(id, request);
        return ResponseEntity.ok(ApiResponse.success("Subject updated", updated, "/api/admin/subjects/" + id));
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<ApiResponse> deleteSubject(@PathVariable String id) {
        adminService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.success("Subject deleted", null, "/api/admin/subjects/" + id));
    }

    // ==================== CURRICULUM ====================
    @GetMapping("/curriculum")
    public ResponseEntity<ApiResponse> getCurriculums(
            @RequestParam(required = false) String departmentId) {
        List<Curriculum> curriculums;
        if (departmentId != null && !departmentId.isEmpty()) {
            curriculums = adminService.getCurriculumsByDepartment(departmentId);
        } else {
            curriculums = adminService.getAllCurriculums();
        }
        return ResponseEntity.ok(ApiResponse.success("Curriculums retrieved", curriculums, "/api/admin/curriculum"));
    }

    @PostMapping("/curriculum")
    public ResponseEntity<ApiResponse> createCurriculum(@RequestBody CurriculumRequest request) {
        Curriculum created = adminService.createCurriculum(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Curriculum created", created, "/api/admin/curriculum"));
    }

    @PutMapping("/curriculum/{id}")
    public ResponseEntity<ApiResponse> updateCurriculum(
            @PathVariable String id,
            @RequestBody CurriculumRequest request) {
        Curriculum updated = adminService.updateCurriculum(id, request);
        return ResponseEntity.ok(ApiResponse.success("Curriculum updated", updated, "/api/admin/curriculum/" + id));
    }

    @DeleteMapping("/curriculum/{id}")
    public ResponseEntity<ApiResponse> deleteCurriculum(@PathVariable String id) {
        adminService.deleteCurriculum(id);
        return ResponseEntity.ok(ApiResponse.success("Curriculum deleted", null, "/api/admin/curriculum/" + id));
    }

    // ==================== ACTIVITY ====================
    @GetMapping("/activity")
    public ResponseEntity<ApiResponse> getActivity() {
        Map<String, Object> activity = adminService.getPlatformActivity();
        return ResponseEntity.ok(ApiResponse.success("Activity retrieved", activity, "/api/admin/activity"));
    }

    @GetMapping("/curriculum/regulation-mapping")
    public ResponseEntity<ApiResponse> getRegulationMapping(
            @RequestParam Integer joiningYear) {
        String regulationCode = adminService.getRegulationCodeByJoiningYear(joiningYear);
        return ResponseEntity.ok(ApiResponse.success("Regulation mapping retrieved", regulationCode, "/api/admin/curriculum/regulation-mapping"));
    }
}