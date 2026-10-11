package com.studyhub.service;

import com.studyhub.dto.request.CurriculumRequest;
import com.studyhub.dto.request.SubjectRequest;
import com.studyhub.dto.response.AdminStatsResponse;
import com.studyhub.dto.response.UserResponse;
import com.studyhub.entity.Curriculum;
import com.studyhub.entity.Department;
import com.studyhub.entity.Regulation;
import com.studyhub.entity.Subject;
import com.studyhub.entity.User;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

public interface AdminService {

    // ==================== STATS ====================
    AdminStatsResponse getStats();
    AdminStatsResponse getStats(String department, String departmentId);

    // ==================== USERS ====================
    Page<UserResponse> getAllUsers(String role, String search, int page, int size);
    UserResponse getUserById(String id);
    UserResponse updateUser(String id, Map<String, Object> updates);
    void deleteUser(String id);

    // ==================== TEACHERS ====================
    // ✅ ADD THIS METHOD
    Page<UserResponse> getPendingTeachers(int page, int size);

    // ==================== MATERIALS ====================
    Page<Map<String, Object>> getAllMaterialsForAdmin(String department, String departmentId, String status, String search, int page, int size);
    void blockMaterial(String id, String adminId, String reason);
    void unblockMaterial(String id, String adminId);

    // ==================== REGULATIONS ====================
    List<Regulation> getAllRegulations();
    Regulation createRegulation(Regulation regulation);
    Regulation updateRegulation(String id, Regulation regulation);
    void deleteRegulation(String id);

    // ==================== DEPARTMENTS ====================
    List<Department> getAllDepartments();
    Department createDepartment(Department department);
    Department updateDepartment(String id, Department department);
    void deleteDepartment(String id);

    // ==================== SUBJECTS ====================
    List<Subject> getAllSubjects();
    List<Subject> getSubjectsByDepartment(String department);
    Subject createSubject(SubjectRequest request);
    Subject updateSubject(String id, SubjectRequest request);
    void deleteSubject(String id);

    // ==================== CURRICULUM ====================
    List<Curriculum> getAllCurriculums();
    List<Curriculum> getCurriculumsByDepartment(String departmentId);
    Curriculum createCurriculum(CurriculumRequest request);
    Curriculum updateCurriculum(String id, CurriculumRequest request);
    void deleteCurriculum(String id);

    // ==================== ACTIVITY ====================
    Map<String, Object> getPlatformActivity();

    // ==================== REGULATION MAPPING ====================
    String getRegulationCodeByJoiningYear(Integer joiningYear);
}