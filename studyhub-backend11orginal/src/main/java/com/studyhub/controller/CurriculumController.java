package com.studyhub.controller;

import com.studyhub.dto.request.CurriculumRequest;
import com.studyhub.dto.response.ApiResponse;
import com.studyhub.dto.response.SubjectResponse;
import com.studyhub.entity.Curriculum;
import com.studyhub.entity.Department;
import com.studyhub.entity.Subject;
import com.studyhub.exception.ResourceNotFoundException;
import com.studyhub.repository.CurriculumRepository;
import com.studyhub.repository.DepartmentRepository;
import com.studyhub.repository.RegulationRepository;
import com.studyhub.repository.SubjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/curriculum")
public class CurriculumController {

    private final CurriculumRepository curriculumRepository;
    private final DepartmentRepository departmentRepository;
    private final RegulationRepository regulationRepository;
    private final SubjectRepository subjectRepository;

    public CurriculumController(CurriculumRepository curriculumRepository,
                                DepartmentRepository departmentRepository,
                                RegulationRepository regulationRepository,
                                SubjectRepository subjectRepository) {
        this.curriculumRepository = curriculumRepository;
        this.departmentRepository = departmentRepository;
        this.regulationRepository = regulationRepository;
        this.subjectRepository = subjectRepository;
    }

    // ==================== PUBLIC ENDPOINTS ====================
    
    @GetMapping("/public")
    public ResponseEntity<ApiResponse> getPublicCurriculums(
            @RequestParam(required = false) String departmentName,
            @RequestParam(required = false) String departmentId) {
        
        List<Curriculum> allCurriculums = curriculumRepository.findAll();
        
        Department dept = null;
        if (departmentId != null && !departmentId.isEmpty()) {
            dept = departmentRepository.findById(departmentId).orElse(null);
        }
        if (dept == null && departmentName != null && !departmentName.isEmpty()) {
            dept = departmentRepository.findAll().stream()
                    .filter(d -> (d.getName() != null && d.getName().equalsIgnoreCase(departmentName)) ||
                                 (d.getCode() != null && d.getCode().equalsIgnoreCase(departmentName)))
                    .findFirst().orElse(null);
        }
        if (dept == null && departmentId != null && !departmentId.isEmpty()) {
            dept = departmentRepository.findAll().stream()
                    .filter(d -> (d.getCode() != null && d.getCode().equalsIgnoreCase(departmentId)) ||
                                 (d.getName() != null && d.getName().equalsIgnoreCase(departmentId)))
                    .findFirst().orElse(null);
        }
        
        final Department finalDept = dept;
        List<Curriculum> filteredCurriculums = allCurriculums;
        
        if (departmentId != null || departmentName != null) {
            filteredCurriculums = allCurriculums.stream()
                    .filter(c -> {
                        boolean match = false;
                        if (departmentId != null && !departmentId.isEmpty()) {
                            match = match || (c.getDepartmentId() != null && (c.getDepartmentId().equalsIgnoreCase(departmentId) ||
                                             (finalDept != null && (c.getDepartmentId().equalsIgnoreCase(finalDept.getId()) ||
                                                                    c.getDepartmentId().equalsIgnoreCase(finalDept.getCode()) ||
                                                                    c.getDepartmentId().equalsIgnoreCase(finalDept.getName())))));
                            match = match || (c.getDepartmentName() != null && (c.getDepartmentName().equalsIgnoreCase(departmentId) ||
                                             (finalDept != null && (c.getDepartmentName().equalsIgnoreCase(finalDept.getName()) ||
                                                                    c.getDepartmentName().equalsIgnoreCase(finalDept.getCode())))));
                        }
                        if (departmentName != null && !departmentName.isEmpty()) {
                            match = match || (c.getDepartmentName() != null && (c.getDepartmentName().equalsIgnoreCase(departmentName) ||
                                             (finalDept != null && (c.getDepartmentName().equalsIgnoreCase(finalDept.getName()) ||
                                                                    c.getDepartmentName().equalsIgnoreCase(finalDept.getCode())))));
                            match = match || (c.getDepartmentId() != null && (c.getDepartmentId().equalsIgnoreCase(departmentName) ||
                                             (finalDept != null && (c.getDepartmentId().equalsIgnoreCase(finalDept.getId()) ||
                                                                    c.getDepartmentId().equalsIgnoreCase(finalDept.getCode())))));
                        }
                        return match;
                    })
                    .collect(Collectors.toList());
        }
        
        return ResponseEntity.ok(
            ApiResponse.success("Curriculums retrieved successfully", filteredCurriculums, "/api/curriculum/public")
        );
    }

    // ===== FIXED: Get subjects with robust department, year, semester matching and fallback =====
    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse> getSubjectsByCurriculum(
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String departmentName,
            @RequestParam(required = false) String regulationId,
            @RequestParam(required = false) Integer joiningYear,
            @RequestParam(required = false) Integer academicYear,
            @RequestParam(required = false) Integer semester) {

        List<Curriculum> allCurriculums = curriculumRepository.findAll();
        List<Department> allDepts = departmentRepository.findAll();

        Department dept = null;
        if (departmentId != null && !departmentId.isEmpty()) {
            dept = allDepts.stream().filter(d -> d.getId() != null && d.getId().equalsIgnoreCase(departmentId)).findFirst().orElse(null);
        }
        
        // Match by code or normalized name
        String targetDeptQuery = departmentName != null && !departmentName.isEmpty() ? departmentName : departmentId;
        if (dept == null && targetDeptQuery != null && !targetDeptQuery.isEmpty()) {
            String normQuery = targetDeptQuery.toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
            dept = allDepts.stream().filter(d -> {
                if (d.getCode() != null && targetDeptQuery.toUpperCase().contains(d.getCode().toUpperCase())) return true;
                if (d.getName() != null) {
                    String normD = d.getName().toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                    if (normD.equals(normQuery) || (normD.length() > 3 && (normQuery.contains(normD) || normD.contains(normQuery)))) return true;
                }
                return false;
            }).findFirst().orElse(null);
        }

        final Department matchedDept = dept;
        final String searchDeptName = matchedDept != null ? matchedDept.getName() : departmentName;
        final String searchDeptId = matchedDept != null ? matchedDept.getId() : departmentId;
        final String searchDeptCode = matchedDept != null ? matchedDept.getCode() : null;

        // STEP 1: Filter curriculums strictly for target department
        List<Curriculum> departmentCurriculums = allCurriculums.stream()
                .filter(c -> {
                    if (searchDeptId == null && searchDeptName == null && searchDeptCode == null) return true;
                    
                    // Match by direct ID
                    if (searchDeptId != null && c.getDepartmentId() != null && c.getDepartmentId().equalsIgnoreCase(searchDeptId)) return true;
                    if (matchedDept != null && c.getDepartmentId() != null && c.getDepartmentId().equalsIgnoreCase(matchedDept.getId())) return true;
                    
                    // Match by code
                    if (searchDeptCode != null) {
                        if (c.getDepartmentName() != null && c.getDepartmentName().equalsIgnoreCase(searchDeptCode)) return true;
                        if (c.getDepartmentId() != null && c.getDepartmentId().equalsIgnoreCase(searchDeptCode)) return true;
                    }

                    // Match by normalized name
                    if (searchDeptName != null && c.getDepartmentName() != null) {
                        if (c.getDepartmentName().equalsIgnoreCase(searchDeptName)) return true;
                        String n1 = searchDeptName.toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                        String n2 = c.getDepartmentName().toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                        if (n1.equals(n2) || (n1.length() > 3 && n2.length() > 3 && (n1.contains(n2) || n2.contains(n1)))) return true;
                    }

                    return false;
                })
                .collect(Collectors.toList());

        // STEP 2: Filter by year and semester within the target department
        Curriculum matchingCurriculum = null;

        if (joiningYear != null && academicYear != null && semester != null) {
            matchingCurriculum = departmentCurriculums.stream()
                    .filter(c -> c.getJoiningYear() != null && c.getJoiningYear().intValue() == joiningYear.intValue())
                    .filter(c -> c.getAcademicYear() != null && c.getAcademicYear().intValue() == academicYear.intValue())
                    .filter(c -> c.getSemester() != null && c.getSemester().intValue() == semester.intValue())
                    .findFirst().orElse(null);
        }

        if (matchingCurriculum == null && joiningYear != null && semester != null) {
            matchingCurriculum = departmentCurriculums.stream()
                    .filter(c -> c.getJoiningYear() != null && c.getJoiningYear().intValue() == joiningYear.intValue())
                    .filter(c -> c.getSemester() != null && c.getSemester().intValue() == semester.intValue())
                    .findFirst().orElse(null);
        }

        if (matchingCurriculum == null && academicYear != null && semester != null) {
            matchingCurriculum = departmentCurriculums.stream()
                    .filter(c -> c.getAcademicYear() != null && c.getAcademicYear().intValue() == academicYear.intValue())
                    .filter(c -> c.getSemester() != null && c.getSemester().intValue() == semester.intValue())
                    .findFirst().orElse(null);
        }

        if (matchingCurriculum == null && semester != null) {
            matchingCurriculum = departmentCurriculums.stream()
                    .filter(c -> c.getSemester() != null && c.getSemester().intValue() == semester.intValue())
                    .findFirst().orElse(null);
        }

        List<SubjectResponse.SubjectInfo> subjectInfos = new ArrayList<>();

        if (matchingCurriculum != null) {
            if (matchingCurriculum.getSubjectNames() != null && !matchingCurriculum.getSubjectNames().isEmpty()) {
                List<String> subjectNames = matchingCurriculum.getSubjectNames();
                List<String> subjectIds = matchingCurriculum.getSubjectIds();
                for (int i = 0; i < subjectNames.size(); i++) {
                    String subId = (subjectIds != null && i < subjectIds.size()) ? subjectIds.get(i) : ("sub-" + i);
                    subjectInfos.add(new SubjectResponse.SubjectInfo(
                        subId,
                        subjectNames.get(i),
                        "Subject from curriculum"
                    ));
                }
            } else if (matchingCurriculum.getSubjectIds() != null && !matchingCurriculum.getSubjectIds().isEmpty()) {
                List<Subject> foundSubjects = subjectRepository.findAllById(matchingCurriculum.getSubjectIds());
                for (Subject sub : foundSubjects) {
                    subjectInfos.add(new SubjectResponse.SubjectInfo(
                        sub.getId(),
                        sub.getSubjectName(),
                        sub.getDescription()
                    ));
                }
            }
        }

        // Fallback: If no subjects found from curriculum, check subjectRepository strictly for target department
        if (subjectInfos.isEmpty()) {
            List<Subject> deptSubjects = new ArrayList<>();
            if (matchedDept != null) {
                if (matchedDept.getName() != null) deptSubjects.addAll(subjectRepository.findByDepartment(matchedDept.getName()));
                if (deptSubjects.isEmpty() && matchedDept.getCode() != null) deptSubjects.addAll(subjectRepository.findByDepartment(matchedDept.getCode()));
            }
            if (deptSubjects.isEmpty() && searchDeptName != null) {
                deptSubjects.addAll(subjectRepository.findByDepartment(searchDeptName));
            }
            for (Subject sub : deptSubjects) {
                subjectInfos.add(new SubjectResponse.SubjectInfo(
                    sub.getId(),
                    sub.getSubjectName(),
                    sub.getDescription()
                ));
            }
        }

        if (subjectInfos.isEmpty()) {
            SubjectResponse emptyResponse = new SubjectResponse(
                matchingCurriculum != null ? matchingCurriculum.getId() : null,
                searchDeptId,
                searchDeptName,
                null, null,
                joiningYear,
                academicYear,
                semester,
                new ArrayList<>()
            );
            return ResponseEntity.ok(
                ApiResponse.success("No subjects found", emptyResponse, "/api/curriculum/subjects")
            );
        }

        SubjectResponse response = new SubjectResponse(
            matchingCurriculum != null ? matchingCurriculum.getId() : null,
            matchingCurriculum != null && matchingCurriculum.getDepartmentId() != null ? matchingCurriculum.getDepartmentId() : searchDeptId,
            matchingCurriculum != null && matchingCurriculum.getDepartmentName() != null ? matchingCurriculum.getDepartmentName() : searchDeptName,
            matchingCurriculum != null ? matchingCurriculum.getRegulationId() : null,
            matchingCurriculum != null ? matchingCurriculum.getRegulationName() : null,
            matchingCurriculum != null ? matchingCurriculum.getJoiningYear() : joiningYear,
            matchingCurriculum != null ? matchingCurriculum.getAcademicYear() : academicYear,
            matchingCurriculum != null ? matchingCurriculum.getSemester() : semester,
            subjectInfos
        );

        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved successfully", response, "/api/curriculum/subjects"));
    }

    @GetMapping("/by-department")
    public ResponseEntity<ApiResponse> getCurriculumsByDepartment(@RequestParam String departmentId) {
        List<Curriculum> curriculums = curriculumRepository.findByDepartmentId(departmentId);
        return ResponseEntity.ok(
            ApiResponse.success("Curriculums retrieved successfully", curriculums, "/api/curriculum/by-department")
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getCurriculumById(@PathVariable String id) {
        Curriculum curriculum = curriculumRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Curriculum not found"));
        return ResponseEntity.ok(
            ApiResponse.success("Curriculum retrieved successfully", curriculum, "/api/curriculum/" + id)
        );
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse> getFilteredCurriculums(
            @RequestParam(required = false) String departmentName,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) Integer joiningYear,
            @RequestParam(required = false) Integer academicYear,
            @RequestParam(required = false) Integer semester) {
        
        List<Curriculum> allCurriculums = curriculumRepository.findAll();
        List<Department> allDepts = departmentRepository.findAll();
        
        Department dept = null;
        if (departmentId != null && !departmentId.isEmpty()) {
            dept = allDepts.stream().filter(d -> d.getId() != null && d.getId().equalsIgnoreCase(departmentId)).findFirst().orElse(null);
        }
        
        String targetDeptQuery = departmentName != null && !departmentName.isEmpty() ? departmentName : departmentId;
        if (dept == null && targetDeptQuery != null && !targetDeptQuery.isEmpty()) {
            String normQuery = targetDeptQuery.toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
            dept = allDepts.stream().filter(d -> {
                if (d.getCode() != null && targetDeptQuery.toUpperCase().contains(d.getCode().toUpperCase())) return true;
                if (d.getName() != null) {
                    String normD = d.getName().toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                    if (normD.equals(normQuery) || (normD.length() > 3 && (normQuery.contains(normD) || normD.contains(normQuery)))) return true;
                }
                return false;
            }).findFirst().orElse(null);
        }

        final Department finalDept = dept;
        final String searchDeptName = finalDept != null ? finalDept.getName() : departmentName;
        final String searchDeptId = finalDept != null ? finalDept.getId() : departmentId;
        final String searchDeptCode = finalDept != null ? finalDept.getCode() : null;
        
        List<Curriculum> filtered = allCurriculums.stream()
                .filter(c -> {
                    if (searchDeptId != null || searchDeptName != null || searchDeptCode != null) {
                        boolean dMatch = false;
                        if (searchDeptId != null && c.getDepartmentId() != null && c.getDepartmentId().equalsIgnoreCase(searchDeptId)) dMatch = true;
                        if (finalDept != null && c.getDepartmentId() != null && c.getDepartmentId().equalsIgnoreCase(finalDept.getId())) dMatch = true;
                        
                        if (!dMatch && searchDeptCode != null) {
                            if (c.getDepartmentName() != null && c.getDepartmentName().equalsIgnoreCase(searchDeptCode)) dMatch = true;
                            if (c.getDepartmentId() != null && c.getDepartmentId().equalsIgnoreCase(searchDeptCode)) dMatch = true;
                        }

                        if (!dMatch && searchDeptName != null && c.getDepartmentName() != null) {
                            if (c.getDepartmentName().equalsIgnoreCase(searchDeptName)) dMatch = true;
                            String n1 = searchDeptName.toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                            String n2 = c.getDepartmentName().toLowerCase().replace("&", "and").replaceAll("[^a-z0-9]", "");
                            if (n1.equals(n2) || (n1.length() > 3 && n2.length() > 3 && (n1.contains(n2) || n2.contains(n1)))) dMatch = true;
                        }

                        if (!dMatch) return false;
                    }

                    if (joiningYear != null) {
                        if (c.getJoiningYear() == null || c.getJoiningYear().intValue() != joiningYear.intValue()) return false;
                    }
                    if (academicYear != null) {
                        if (c.getAcademicYear() == null || c.getAcademicYear().intValue() != academicYear.intValue()) return false;
                    }
                    if (semester != null) {
                        if (c.getSemester() == null || c.getSemester().intValue() != semester.intValue()) return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(
            ApiResponse.success("Filtered curriculums retrieved", filtered, "/api/curriculum/filter")
        );
    }

    // ==================== ADMIN ONLY ENDPOINTS ====================

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAllCurriculums() {
        List<Curriculum> curriculums = curriculumRepository.findAll();
        return ResponseEntity.ok(
            ApiResponse.success("Curriculums retrieved successfully", curriculums, "/api/curriculum/admin/all")
        );
    }

    @PostMapping("/admin/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> createCurriculum(@RequestBody CurriculumRequest request) {
        
        System.out.println("========================================");
        System.out.println("📝 CREATE CURRICULUM");
        System.out.println("  DepartmentId: " + request.getDepartmentId());
        System.out.println("  JoiningYear: " + request.getJoiningYear());
        System.out.println("  AcademicYear: " + request.getAcademicYear());
        System.out.println("  Semester: " + request.getSemester());
        System.out.println("========================================");
        
        validateCurriculumRequest(request);
        
        boolean exists = curriculumRepository.existsByDepartmentIdAndRegulationIdAndJoiningYearAndAcademicYearAndSemester(
            request.getDepartmentId(), request.getRegulationId(), 
            request.getJoiningYear(), request.getAcademicYear(), request.getSemester()
        );
        
        if (exists) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("Curriculum already exists for this combination", "/api/curriculum/admin/create"));
        }

        String departmentName = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()))
            .getName();

        String regulationName = regulationRepository.findById(request.getRegulationId())
            .orElseThrow(() -> new ResourceNotFoundException("Regulation not found"))
            .getName();

        validateSubjectsExist(request.getSubjectIds());

        Curriculum curriculum = new Curriculum();
        curriculum.setDepartmentId(request.getDepartmentId());
        curriculum.setDepartmentName(departmentName);
        curriculum.setRegulationId(request.getRegulationId());
        curriculum.setRegulationName(regulationName);
        curriculum.setJoiningYear(request.getJoiningYear());
        curriculum.setAcademicYear(request.getAcademicYear());
        curriculum.setSemester(request.getSemester());
        curriculum.setSubjectIds(request.getSubjectIds());
        curriculum.setSubjectNames(request.getSubjectNames());
        curriculum.setActive(true);
        curriculum.setCreatedAt(LocalDateTime.now());
        curriculum.setUpdatedAt(LocalDateTime.now());

        Curriculum saved = curriculumRepository.save(curriculum);
        
        System.out.println("✅ CURRICULUM CREATED!");
        System.out.println("  ID: " + saved.getId());
        System.out.println("  Department Name: " + saved.getDepartmentName());
        System.out.println("========================================");
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Curriculum created successfully", saved, "/api/curriculum/admin/create"));
    }

    @PutMapping("/admin/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateCurriculum(
            @PathVariable String id,
            @RequestBody CurriculumRequest request) {
        
        Curriculum curriculum = curriculumRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Curriculum not found"));

        validateCurriculumRequest(request);
        validateSubjectsExist(request.getSubjectIds());

        String departmentName = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new ResourceNotFoundException("Department not found"))
            .getName();

        String regulationName = regulationRepository.findById(request.getRegulationId())
            .orElseThrow(() -> new ResourceNotFoundException("Regulation not found"))
            .getName();

        curriculum.setDepartmentId(request.getDepartmentId());
        curriculum.setDepartmentName(departmentName);
        curriculum.setRegulationId(request.getRegulationId());
        curriculum.setRegulationName(regulationName);
        curriculum.setJoiningYear(request.getJoiningYear());
        curriculum.setAcademicYear(request.getAcademicYear());
        curriculum.setSemester(request.getSemester());
        curriculum.setSubjectIds(request.getSubjectIds());
        curriculum.setSubjectNames(request.getSubjectNames());
        curriculum.setUpdatedAt(LocalDateTime.now());

        Curriculum updated = curriculumRepository.save(curriculum);
        
        return ResponseEntity.ok(
            ApiResponse.success("Curriculum updated successfully", updated, "/api/curriculum/admin/update/" + id)
        );
    }
// Add to CurriculumController.java

@GetMapping("/debug")
public ResponseEntity<ApiResponse> debugCurriculum() {
    List<Curriculum> all = curriculumRepository.findAll();
    System.out.println("=== DEBUG: ALL CURRICULUMS ===");
    System.out.println("Total: " + all.size());
    all.forEach(c -> {
        System.out.println("ID: " + c.getId());
        System.out.println("  DepartmentId: '" + c.getDepartmentId() + "'");
        System.out.println("  JoiningYear: " + c.getJoiningYear());
        System.out.println("  AcademicYear: " + c.getAcademicYear());
        System.out.println("  Semester: " + c.getSemester());
        System.out.println("  ---");
    });
    return ResponseEntity.ok(ApiResponse.success("Debug", all, "/debug"));
}
    @DeleteMapping("/admin/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteCurriculum(@PathVariable String id) {
        if (!curriculumRepository.existsById(id)) {
            throw new ResourceNotFoundException("Curriculum not found");
        }
        curriculumRepository.deleteById(id);
        return ResponseEntity.ok(
            ApiResponse.success("Curriculum deleted successfully", null, "/api/curriculum/admin/delete/" + id)
        );
    }

    private void validateCurriculumRequest(CurriculumRequest request) {
        if (request.getDepartmentId() == null || request.getDepartmentId().isEmpty()) {
            throw new IllegalArgumentException("Department ID is required");
        }
        if (request.getRegulationId() == null || request.getRegulationId().isEmpty()) {
            throw new IllegalArgumentException("Regulation ID is required");
        }
        if (request.getJoiningYear() == null) {
            throw new IllegalArgumentException("Joining Year is required");
        }
        if (request.getAcademicYear() == null) {
            throw new IllegalArgumentException("Academic Year is required");
        }
        if (request.getSemester() == null) {
            throw new IllegalArgumentException("Semester is required");
        }
        if (request.getSubjectIds() == null || request.getSubjectIds().isEmpty()) {
            throw new IllegalArgumentException("At least one subject is required");
        }
    }

    private void validateSubjectsExist(List<String> subjectIds) {
        List<Subject> subjects = subjectRepository.findAllById(subjectIds);
        if (subjects.size() != subjectIds.size()) {
            throw new IllegalArgumentException("One or more subjects do not exist");
        }
    }
}