package com.studyhub.serviceImpl;

import com.studyhub.dto.request.CurriculumRequest;
import com.studyhub.dto.request.SubjectRequest;
import com.studyhub.dto.response.AdminStatsResponse;
import com.studyhub.dto.response.UserResponse;
import com.studyhub.entity.*;
import com.studyhub.exception.ResourceNotFoundException;
import com.studyhub.repository.*;
import com.studyhub.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private RegulationRepository regulationRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private CurriculumRepository curriculumRepository;

    @Autowired
    private AISummaryRepository aiSummaryRepository;

    @Autowired
    private ChatHistoryRepository chatHistoryRepository;

    // ==================== STATS ====================
    @Override
    public AdminStatsResponse getStats() {
        return getStats(null, null);
    }

    @Override
    public AdminStatsResponse getStats(String department, String departmentId) {
        if ((department == null || department.trim().isEmpty()) && (departmentId == null || departmentId.trim().isEmpty())) {
            long totalUsers = userRepository.count();
            long totalTeachers = userRepository.countByRole("ROLE_TEACHER") + userRepository.countByRole("TEACHER");
            long totalStudents = userRepository.countByRole("ROLE_STUDENT") + userRepository.countByRole("STUDENT");
            long totalMaterials = materialRepository.count();
            long totalSubjects = subjectRepository.count();
            long totalRegulations = regulationRepository.count();
            long totalDepartments = departmentRepository.count();
            long totalCurriculums = curriculumRepository.count();
            long pendingTeachers = userRepository.countByRoleAndStatus("ROLE_TEACHER", "PENDING") + userRepository.countByRoleAndStatus("TEACHER", "PENDING");
            long activeMaterials = materialRepository.countByStatus("ACTIVE");
            long blockedMaterials = materialRepository.countByStatus("BLOCKED");

            AdminStatsResponse stats = new AdminStatsResponse();
            stats.setTotalUsers(totalUsers);
            stats.setTotalTeachers(totalTeachers);
            stats.setTotalStudents(totalStudents);
            stats.setTotalMaterials(totalMaterials);
            stats.setTotalSubjects(totalSubjects);
            stats.setTotalRegulations(totalRegulations);
            stats.setTotalDepartments(totalDepartments);
            stats.setTotalCurriculums(totalCurriculums);
            stats.setPendingTeachers(pendingTeachers);
            stats.setActiveMaterials(activeMaterials);
            stats.setBlockedMaterials(blockedMaterials);
            return stats;
        }

        // Department-filtered stats
        String normQ = department != null ? department.trim().toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "") : "";
        String deptIdStr = departmentId != null ? departmentId.trim() : "";

        // Materials
        List<Material> allMats = materialRepository.findAll();
        List<Material> deptMats = allMats.stream().filter(m -> {
            if (!deptIdStr.isEmpty() && deptIdStr.equalsIgnoreCase(m.getDepartmentId())) return true;
            if (!normQ.isEmpty()) {
                if (m.getDepartmentId() != null) {
                    String dIdNorm = m.getDepartmentId().toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                    if (dIdNorm.equals(normQ) || dIdNorm.contains(normQ) || normQ.contains(dIdNorm)) return true;
                }
                if (m.getDepartment() != null) {
                    String dNorm = m.getDepartment().toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                    if (dNorm.equals(normQ) || dNorm.contains(normQ) || normQ.contains(dNorm)) return true;
                }
                if (m.getDepartmentName() != null) {
                    String dNorm = m.getDepartmentName().toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                    if (dNorm.equals(normQ) || dNorm.contains(normQ) || normQ.contains(dNorm)) return true;
                }
            }
            return false;
        }).collect(Collectors.toList());

        long totalMaterials = deptMats.size();
        long activeMaterials = deptMats.stream().filter(m -> "ACTIVE".equalsIgnoreCase(m.getStatus())).count();
        long blockedMaterials = deptMats.stream().filter(m -> "BLOCKED".equalsIgnoreCase(m.getStatus())).count();

        // Users
        List<User> allUsers = userRepository.findAll();
        List<User> deptUsers = allUsers.stream().filter(u -> {
            if (!deptIdStr.isEmpty() && deptIdStr.equalsIgnoreCase(u.getDepartmentId())) return true;
            if (!normQ.isEmpty()) {
                if (u.getDepartmentId() != null) {
                    String dIdNorm = u.getDepartmentId().toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                    if (dIdNorm.equals(normQ) || dIdNorm.contains(normQ) || normQ.contains(dIdNorm)) return true;
                }
                if (u.getDepartment() != null) {
                    String dNorm = u.getDepartment().toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                    if (dNorm.equals(normQ) || dNorm.contains(normQ) || normQ.contains(dNorm)) return true;
                }
            }
            return false;
        }).collect(Collectors.toList());

        long totalUsers = deptUsers.size();
        long totalStudents = deptUsers.stream().filter(u -> u.getRole() != null && (u.getRole().equalsIgnoreCase("ROLE_STUDENT") || u.getRole().equalsIgnoreCase("STUDENT"))).count();
        long totalTeachers = deptUsers.stream().filter(u -> u.getRole() != null && (u.getRole().equalsIgnoreCase("ROLE_TEACHER") || u.getRole().equalsIgnoreCase("TEACHER"))).count();
        long pendingTeachers = deptUsers.stream().filter(u -> u.getRole() != null && (u.getRole().equalsIgnoreCase("ROLE_TEACHER") || u.getRole().equalsIgnoreCase("TEACHER")) && "PENDING".equalsIgnoreCase(u.getStatus())).count();

        // Curriculums
        List<Curriculum> allCurrs = curriculumRepository.findAll();
        List<Curriculum> deptCurrs = allCurrs.stream().filter(c -> {
            if (!deptIdStr.isEmpty() && deptIdStr.equalsIgnoreCase(c.getDepartmentId())) return true;
            if (!normQ.isEmpty()) {
                if (c.getDepartmentId() != null) {
                    String dIdNorm = c.getDepartmentId().toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                    if (dIdNorm.equals(normQ) || dIdNorm.contains(normQ) || normQ.contains(dIdNorm)) return true;
                }
                if (c.getDepartmentName() != null) {
                    String dNorm = c.getDepartmentName().toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                    if (dNorm.equals(normQ) || dNorm.contains(normQ) || normQ.contains(dNorm)) return true;
                }
            }
            return false;
        }).collect(Collectors.toList());
        long totalCurriculums = deptCurrs.size();

        // Unique subjects for this department
        Set<String> deptSubjects = new HashSet<>();
        deptMats.forEach(m -> {
            if (m.getSubjectName() != null && !m.getSubjectName().trim().isEmpty()) deptSubjects.add(m.getSubjectName().trim().toLowerCase());
            else if (m.getSubject() != null && !m.getSubject().trim().isEmpty()) deptSubjects.add(m.getSubject().trim().toLowerCase());
        });
        deptCurrs.forEach(c -> {
            if (c.getSubjectNames() != null) {
                c.getSubjectNames().forEach(s -> { if (s != null && !s.trim().isEmpty()) deptSubjects.add(s.trim().toLowerCase()); });
            }
        });
        long totalSubjects = deptSubjects.size();

        AdminStatsResponse stats = new AdminStatsResponse();
        stats.setTotalUsers(totalUsers);
        stats.setTotalTeachers(totalTeachers);
        stats.setTotalStudents(totalStudents);
        stats.setTotalMaterials(totalMaterials);
        stats.setTotalSubjects(totalSubjects);
        stats.setTotalRegulations(regulationRepository.count());
        stats.setTotalDepartments(1);
        stats.setTotalCurriculums(totalCurriculums);
        stats.setPendingTeachers(pendingTeachers);
        stats.setActiveMaterials(activeMaterials);
        stats.setBlockedMaterials(blockedMaterials);

        return stats;
    }

    // ==================== USERS ====================
    @Override
    public Page<UserResponse> getAllUsers(String role, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> users;

        if (role != null && !role.isEmpty() && search != null && !search.isEmpty()) {
            users = userRepository.findByRoleAndEmailContainingIgnoreCase(role, search, pageable);
        } else if (role != null && !role.isEmpty()) {
            users = userRepository.findByRole(role, pageable);
        } else if (search != null && !search.isEmpty()) {
            users = userRepository.findByEmailContainingIgnoreCase(search, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }

        return users.map(this::convertToResponse);
    }

    @Override
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return convertToResponse(user);
    }

    @Override
    public UserResponse updateUser(String id, Map<String, Object> updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        updates.forEach((key, value) -> {
            switch (key) {
                case "firstName":
                    user.setFirstName((String) value);
                    break;
                case "lastName":
                    user.setLastName((String) value);
                    break;
                case "email":
                    user.setEmail((String) value);
                    break;
                case "role":
                    user.setRole((String) value);
                    break;
                case "department":
                    user.setDepartment((String) value);
                    break;
                case "departmentId":
                    user.setDepartmentId((String) value);
                    break;
                case "rollNumber":
                    user.setRollNumber((String) value);
                    break;
                case "employeeId":
                    user.setEmployeeId((String) value);
                    break;
                case "branch":
                    user.setBranch((String) value);
                    break;
                case "year":
                    user.setYear((Integer) value);
                    break;
                case "semester":
                    user.setSemester((Integer) value);
                    break;
                case "joiningYear":
                    user.setJoiningYear((Integer) value);
                    break;
                case "status":
                    user.setStatus((String) value);
                    break;
                case "active":
                    user.setActive((Boolean) value);
                    break;
            }
        });

        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }

    @Override
    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        userRepository.delete(user);
    }

    // ==================== TEACHERS ====================
    // ✅ ADD THIS METHOD
    @Override
    public Page<UserResponse> getPendingTeachers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> pendingTeachers = userRepository.findByRoleAndStatus("ROLE_TEACHER", "PENDING", pageable);
        return pendingTeachers.map(this::convertToResponse);
    }

    // ==================== MATERIALS ====================
    @Override
    public Page<Map<String, Object>> getAllMaterialsForAdmin(String department, String departmentId, String status, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Material> allMaterials = materialRepository.findAll();

        // Filter strictly by department if provided
        final String deptQuery = department != null && !department.isEmpty() ? department : departmentId;
        List<Material> filtered = allMaterials.stream().filter(m -> {
            if (deptQuery != null && !deptQuery.trim().isEmpty()) {
                String normQ = deptQuery.toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                boolean dMatch = false;
                if (m.getDepartmentId() != null && m.getDepartmentId().equalsIgnoreCase(deptQuery)) dMatch = true;
                if (!dMatch && m.getDepartment() != null) {
                    String normD = m.getDepartment().toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                    if (normD.equals(normQ) || normD.contains(normQ) || normQ.contains(normD)) dMatch = true;
                }
                if (!dMatch && m.getDepartmentName() != null) {
                    String normD = m.getDepartmentName().toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                    if (normD.equals(normQ) || normD.contains(normQ) || normQ.contains(normD)) dMatch = true;
                }
                if (!dMatch) return false;
            }

            if (status != null && !status.isEmpty()) {
                if (m.getStatus() == null || !m.getStatus().equalsIgnoreCase(status)) return false;
            }

            if (search != null && !search.isEmpty()) {
                String s = search.toLowerCase();
                boolean sMatch = (m.getTitle() != null && m.getTitle().toLowerCase().contains(s)) ||
                                 (m.getSubjectName() != null && m.getSubjectName().toLowerCase().contains(s)) ||
                                 (m.getSubject() != null && m.getSubject().toLowerCase().contains(s));
                if (!sMatch) return false;
            }

            return true;
        }).collect(Collectors.toList());

        // Sort descending by createdAt
        filtered.sort((a, b) -> {
            if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        int start = Math.min((int) pageable.getOffset(), filtered.size());
        int end = Math.min((start + pageable.getPageSize()), filtered.size());
        List<Material> pageContent = filtered.subList(start, end);
        Page<Material> materials = new PageImpl<>(pageContent, pageable, filtered.size());

        return materials.map(m -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("title", m.getTitle());
            map.put("description", m.getDescription());
            map.put("subject", m.getSubject() != null ? m.getSubject() : m.getSubjectName());
            map.put("subjectId", m.getSubjectId());
            map.put("subjectName", m.getSubjectName());
            map.put("department", m.getDepartment() != null ? m.getDepartment() : m.getDepartmentName());
            map.put("departmentId", m.getDepartmentId());
            map.put("departmentName", m.getDepartmentName());
            map.put("year", m.getYear() != null ? m.getYear() : (m.getAcademicYear() != null ? String.valueOf(m.getAcademicYear()) : ""));
            map.put("academicYear", m.getAcademicYear());
            map.put("joiningYear", m.getJoiningYear());
            map.put("semester", m.getSemester());
            map.put("type", m.getType());
            map.put("fileUrl", m.getFileUrl());
            map.put("fileName", m.getFileName());
            map.put("fileSize", m.getFileSize());
            map.put("youTubeUrl", m.getYouTubeUrl());
            map.put("uploadedBy", m.getUploadedBy());
            map.put("uploadedByName", m.getUploadedByName());
            map.put("uploadedByEmail", m.getUploadedByEmail());
            map.put("status", m.getStatus());
            map.put("adminNotes", m.getAdminNotes());
            map.put("createdAt", m.getCreatedAt());
            map.put("updatedAt", m.getUpdatedAt());
            return map;
        });
    }

    @Override
    public void blockMaterial(String id, String adminId, String reason) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material", "id", id));
        material.setStatus("BLOCKED");
        material.setAdminNotes(reason);
        materialRepository.save(material);
    }

    @Override
    public void unblockMaterial(String id, String adminId) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material", "id", id));
        material.setStatus("ACTIVE");
        material.setAdminNotes(null);
        materialRepository.save(material);
    }

    // ==================== REGULATIONS ====================
    @Override
    public List<Regulation> getAllRegulations() {
        return regulationRepository.findAll();
    }

    @Override
    public Regulation createRegulation(Regulation regulation) {
        regulation.setCreatedAt(LocalDateTime.now());
        regulation.setUpdatedAt(LocalDateTime.now());
        return regulationRepository.save(regulation);
    }

    @Override
    public Regulation updateRegulation(String id, Regulation regulation) {
        Regulation existing = regulationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Regulation", "id", id));
        existing.setName(regulation.getName());
        existing.setCode(regulation.getCode());
        existing.setDescription(regulation.getDescription());
        existing.setActive(regulation.getActive());
        existing.setUpdatedAt(LocalDateTime.now());
        return regulationRepository.save(existing);
    }

    @Override
    public void deleteRegulation(String id) {
        regulationRepository.deleteById(id);
    }

    // ==================== DEPARTMENTS ====================
    @Override
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @Override
    public Department createDepartment(Department department) {
        department.setCreatedAt(LocalDateTime.now());
        department.setUpdatedAt(LocalDateTime.now());
        return departmentRepository.save(department);
    }

    @Override
    public Department updateDepartment(String id, Department department) {
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        existing.setName(department.getName());
        existing.setCode(department.getCode());
        existing.setActive(department.getActive());
        existing.setUpdatedAt(LocalDateTime.now());
        return departmentRepository.save(existing);
    }

    @Override
    public void deleteDepartment(String id) {
        departmentRepository.deleteById(id);
    }

    // ==================== SUBJECTS ====================
    @Override
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @Override
    public List<Subject> getSubjectsByDepartment(String department) {
        if (department == null || department.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        List<Subject> allSubs = subjectRepository.findAll();
        List<Department> allDepts = departmentRepository.findAll();

        Department matched = allDepts.stream()
                .filter(d -> (d.getId() != null && d.getId().equalsIgnoreCase(department)) ||
                             (d.getName() != null && d.getName().equalsIgnoreCase(department)) ||
                             (d.getCode() != null && d.getCode().equalsIgnoreCase(department)))
                .findFirst().orElse(null);

        if (matched == null) {
            String normQuery = department.toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
            matched = allDepts.stream().filter(d -> {
                if (d.getCode() != null && department.toUpperCase().contains(d.getCode().toUpperCase())) return true;
                if (d.getName() != null) {
                    String normD = d.getName().toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                    if (normD.equals(normQuery) || (normD.length() > 3 && (normQuery.contains(normD) || normD.contains(normQuery)))) return true;
                }
                return false;
            }).findFirst().orElse(null);
        }

        final Department finalDept = matched;
        final String deptName = finalDept != null ? finalDept.getName() : department;
        final String deptCode = finalDept != null ? finalDept.getCode() : null;
        final String deptId = finalDept != null ? finalDept.getId() : department;

        return allSubs.stream().filter(s -> {
            if (s.getDepartmentId() != null && (s.getDepartmentId().equalsIgnoreCase(deptId) || (finalDept != null && s.getDepartmentId().equalsIgnoreCase(finalDept.getId())))) {
                return true;
            }
            if (deptCode != null && s.getDepartment() != null && s.getDepartment().equalsIgnoreCase(deptCode)) {
                return true;
            }
            if (s.getDepartment() != null) {
                if (s.getDepartment().equalsIgnoreCase(deptName)) return true;
                String n1 = s.getDepartment().toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                String n2 = deptName.toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                if (n1.equals(n2) || (n1.length() > 3 && n2.length() > 3 && (n1.contains(n2) || n2.contains(n1)))) return true;
            }
            return false;
        }).collect(Collectors.toList());
    }

    @Override
    public Subject createSubject(SubjectRequest request) {
        Subject subject = new Subject();
        subject.setSubjectName(request.getSubjectName());
        subject.setDescription(request.getDescription());
        subject.setDepartment(request.getDepartment());
        subject.setActive(true);
        subject.setCreatedAt(LocalDateTime.now());
        subject.setUpdatedAt(LocalDateTime.now());
        return subjectRepository.save(subject);
    }

    @Override
    public Subject updateSubject(String id, SubjectRequest request) {
        Subject existing = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));
        existing.setSubjectName(request.getSubjectName());
        existing.setDescription(request.getDescription());
        existing.setDepartment(request.getDepartment());
        existing.setUpdatedAt(LocalDateTime.now());
        return subjectRepository.save(existing);
    }

    @Override
    public void deleteSubject(String id) {
        subjectRepository.deleteById(id);
    }

    // ==================== CURRICULUM ====================
    @Override
    public List<Curriculum> getAllCurriculums() {
        return curriculumRepository.findAll();
    }

    @Override
    public List<Curriculum> getCurriculumsByDepartment(String departmentId) {
        if (departmentId == null || departmentId.trim().isEmpty()) {
            return curriculumRepository.findAll();
        }
        Department dept = departmentRepository.findById(departmentId).orElse(null);
        if (dept == null) {
            dept = departmentRepository.findAll().stream()
                    .filter(d -> (d.getCode() != null && d.getCode().equalsIgnoreCase(departmentId)) ||
                                 (d.getName() != null && d.getName().equalsIgnoreCase(departmentId)))
                    .findFirst().orElse(null);
        }
        final Department finalDept = dept;
        return curriculumRepository.findAll().stream()
                .filter(c -> {
                    boolean match = false;
                    if (c.getDepartmentId() != null) {
                        match = c.getDepartmentId().equalsIgnoreCase(departmentId) ||
                                (finalDept != null && (c.getDepartmentId().equalsIgnoreCase(finalDept.getId()) ||
                                                       c.getDepartmentId().equalsIgnoreCase(finalDept.getCode()) ||
                                                       c.getDepartmentId().equalsIgnoreCase(finalDept.getName())));
                    }
                    if (!match && c.getDepartmentName() != null) {
                        match = c.getDepartmentName().equalsIgnoreCase(departmentId) ||
                                (finalDept != null && (c.getDepartmentName().equalsIgnoreCase(finalDept.getName()) ||
                                                       c.getDepartmentName().equalsIgnoreCase(finalDept.getCode())));
                    }
                    return match;
                })
                .collect(Collectors.toList());
    }

    @Override
    public Curriculum createCurriculum(CurriculumRequest request) {
        Curriculum curriculum = new Curriculum();
        curriculum.setDepartmentId(request.getDepartmentId());
        
        if (request.getDepartmentId() != null && !request.getDepartmentId().trim().isEmpty()) {
            Department dept = departmentRepository.findById(request.getDepartmentId()).orElse(null);
            if (dept == null) {
                dept = departmentRepository.findAll().stream()
                        .filter(d -> (d.getCode() != null && d.getCode().equalsIgnoreCase(request.getDepartmentId())) ||
                                     (d.getName() != null && d.getName().equalsIgnoreCase(request.getDepartmentId())))
                        .findFirst().orElse(null);
            }
            if (dept != null) {
                curriculum.setDepartmentName(dept.getName());
                curriculum.setDepartmentId(dept.getId());
            }
        }

        if (request.getRegulationId() != null && !request.getRegulationId().trim().isEmpty()) {
            Regulation reg = regulationRepository.findById(request.getRegulationId()).orElse(null);
            if (reg == null) {
                reg = regulationRepository.findAll().stream()
                        .filter(r -> (r.getCode() != null && r.getCode().equalsIgnoreCase(request.getRegulationId())) ||
                                     (r.getName() != null && r.getName().equalsIgnoreCase(request.getRegulationId())))
                        .findFirst().orElse(null);
            }
            if (reg != null) {
                curriculum.setRegulationName(reg.getName());
                curriculum.setRegulationId(reg.getId());
            }
        } else if (request.getJoiningYear() != null) {
            String regCode = getRegulationCodeByJoiningYear(request.getJoiningYear());
            Regulation reg = regulationRepository.findAll().stream()
                    .filter(r -> r.getCode() != null && r.getCode().equalsIgnoreCase(regCode))
                    .findFirst().orElse(null);
            if (reg != null) {
                curriculum.setRegulationId(reg.getId());
                curriculum.setRegulationName(reg.getName());
            }
        }

        curriculum.setJoiningYear(request.getJoiningYear());
        curriculum.setAcademicYear(request.getAcademicYear());
        curriculum.setSemester(request.getSemester());
        curriculum.setSubjectIds(request.getSubjectIds());
        curriculum.setSubjectNames(request.getSubjectNames());
        curriculum.setActive(true);
        curriculum.setCreatedAt(LocalDateTime.now());
        curriculum.setUpdatedAt(LocalDateTime.now());
        return curriculumRepository.save(curriculum);
    }

    @Override
    public Curriculum updateCurriculum(String id, CurriculumRequest request) {
        Curriculum existing = curriculumRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curriculum", "id", id));
        existing.setDepartmentId(request.getDepartmentId());
        
        if (request.getDepartmentId() != null && !request.getDepartmentId().trim().isEmpty()) {
            Department dept = departmentRepository.findById(request.getDepartmentId()).orElse(null);
            if (dept == null) {
                dept = departmentRepository.findAll().stream()
                        .filter(d -> (d.getCode() != null && d.getCode().equalsIgnoreCase(request.getDepartmentId())) ||
                                     (d.getName() != null && d.getName().equalsIgnoreCase(request.getDepartmentId())))
                        .findFirst().orElse(null);
            }
            if (dept != null) {
                existing.setDepartmentName(dept.getName());
                existing.setDepartmentId(dept.getId());
            }
        }

        if (request.getRegulationId() != null && !request.getRegulationId().trim().isEmpty()) {
            Regulation reg = regulationRepository.findById(request.getRegulationId()).orElse(null);
            if (reg == null) {
                reg = regulationRepository.findAll().stream()
                        .filter(r -> (r.getCode() != null && r.getCode().equalsIgnoreCase(request.getRegulationId())) ||
                                     (r.getName() != null && r.getName().equalsIgnoreCase(request.getRegulationId())))
                        .findFirst().orElse(null);
            }
            if (reg != null) {
                existing.setRegulationName(reg.getName());
                existing.setRegulationId(reg.getId());
            }
        }

        existing.setJoiningYear(request.getJoiningYear());
        existing.setAcademicYear(request.getAcademicYear());
        existing.setSemester(request.getSemester());
        existing.setSubjectIds(request.getSubjectIds());
        existing.setSubjectNames(request.getSubjectNames());
        existing.setUpdatedAt(LocalDateTime.now());
        return curriculumRepository.save(existing);
    }

    @Override
    public void deleteCurriculum(String id) {
        curriculumRepository.deleteById(id);
    }

    // ==================== ACTIVITY ====================
    @Override
    public Map<String, Object> getPlatformActivity() {
        Map<String, Object> activity = new HashMap<>();
        activity.put("totalUsers", userRepository.count());
        activity.put("totalMaterials", materialRepository.count());
        activity.put("totalChats", chatHistoryRepository.count());
        activity.put("totalSummaries", aiSummaryRepository.count());
        return activity;
    }

    // ==================== REGULATION MAPPING ====================
    @Override
    public String getRegulationCodeByJoiningYear(Integer joiningYear) {
        if (joiningYear >= 2020 && joiningYear <= 2022) {
            return "R20";
        } else if (joiningYear >= 2023 && joiningYear <= 2025) {
            return "R23";
        } else if (joiningYear >= 2026 && joiningYear <= 2028) {
            return "R26";
        } else if (joiningYear >= 2029 && joiningYear <= 2031) {
            return "R29";
        } else if (joiningYear >= 2032 && joiningYear <= 2034) {
            return "R32";
        } else {
            return "R23"; // Default fallback
        }
    }

    // ==================== HELPER METHODS ====================
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
        response.setActive(user.getActive());
        response.setStatus(user.getStatus());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}