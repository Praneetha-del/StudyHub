package com.studyhub.controller;

import com.studyhub.dto.request.MaterialRequest;
import com.studyhub.dto.response.ApiResponse;
import com.studyhub.dto.response.MaterialResponse;
import com.studyhub.entity.Department;
import com.studyhub.entity.User;
import com.studyhub.repository.DepartmentRepository;
import com.studyhub.repository.UserRepository;
import com.studyhub.security.JwtTokenProvider;
import com.studyhub.service.MaterialService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/materials")
public class MaterialController {

    private final MaterialService materialService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public MaterialController(MaterialService materialService,
                              JwtTokenProvider jwtTokenProvider,
                              UserRepository userRepository,
                              DepartmentRepository departmentRepository) {
        this.materialService = materialService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse> uploadMaterial(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("department") String department,
            @RequestParam("departmentId") String departmentId,
            @RequestParam("joiningYear") String joiningYear,
            @RequestParam("academicYear") String academicYear,
            @RequestParam("semester") String semester,
            @RequestParam(value = "regulation", required = false) String regulation,
            @RequestParam(value = "regulationId", required = false) String regulationId,
            @RequestParam(value = "regulationName", required = false) String regulationName,
            @RequestParam("subjectId") String subjectId,
            @RequestParam("subjectName") String subjectName,
            @RequestParam("type") String type,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "youTubeUrl", required = false) String youTubeUrl,
            @RequestHeader(value = "Authorization", required = false) String token) {

        System.out.println("========================================");
        System.out.println("📤 UPLOAD MATERIAL REQUEST");
        System.out.println("  Title: " + title);
        System.out.println("  Department: " + department);
        System.out.println("  DepartmentId: " + departmentId);
        System.out.println("  JoiningYear: " + joiningYear);
        System.out.println("  AcademicYear: " + academicYear);
        System.out.println("  Semester (raw): " + semester);
        System.out.println("  Regulation: " + regulation);
        System.out.println("  SubjectId: " + subjectId);
        System.out.println("  SubjectName: " + subjectName);
        System.out.println("  Type: " + type);
        System.out.println("========================================");

        try {
            // ✅ Get user
            String userId = getUserIdFromToken(token);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // ✅ Validate
            if ((file == null || file.isEmpty()) && (youTubeUrl == null || youTubeUrl.isEmpty())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Either file or YouTube URL is required", "/api/materials/upload"));
            }

            // ✅ Parse values with proper error handling
            Integer joiningYearInt = parseInteger(joiningYear, "joiningYear");
            Integer academicYearInt = parseInteger(academicYear, "academicYear");
            Integer semesterInt = parseInteger(semester, "semester");

            System.out.println("  ✅ Parsed JoiningYear: " + joiningYearInt);
            System.out.println("  ✅ Parsed AcademicYear: " + academicYearInt);
            System.out.println("  ✅ Parsed Semester: " + semesterInt);

            // ✅ Build request
            MaterialRequest request = new MaterialRequest();
            request.setTitle(title);
            request.setDescription(description);
            request.setDepartment(department);
            request.setDepartmentId(departmentId);
            request.setJoiningYear(joiningYearInt);
            request.setAcademicYear(academicYearInt);
            request.setSemester(semesterInt);
            request.setRegulation(regulation != null ? regulation : regulationName);
            request.setRegulationId(regulationId);
            request.setRegulationName(regulationName != null ? regulationName : regulation);
            request.setSubjectId(subjectId);
            request.setSubjectName(subjectName);
            request.setType(type);
            request.setYouTubeUrl(youTubeUrl);
            request.setFileName(file != null ? file.getOriginalFilename() : null);

            // ✅ Upload
            MaterialResponse response;
            if (file != null && !file.isEmpty()) {
                response = materialService.uploadMaterial(
                    request, file, userId, user.getEmail(), 
                    user.getFirstName() + " " + user.getLastName()
                );
            } else {
                response = materialService.uploadYouTubeMaterial(
                    request, userId, user.getEmail(), 
                    user.getFirstName() + " " + user.getLastName()
                );
            }

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Material uploaded successfully", response, "/api/materials/upload"));

        } catch (NumberFormatException e) {
            System.err.println("❌ Number format error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid number format: " + e.getMessage(), "/api/materials/upload"));
        } catch (Exception e) {
            System.err.println("❌ Upload error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Upload failed: " + e.getMessage(), "/api/materials/upload"));
        }
    }

    // ✅ Helper method to parse integer with error handling
    private Integer parseInteger(String value, String fieldName) {
        if (value == null || value.isEmpty()) {
            throw new NumberFormatException(fieldName + " is null or empty");
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            throw new NumberFormatException("Invalid " + fieldName + ": " + value);
        }
    }
@GetMapping("/{id}/download")
public ResponseEntity<?> downloadMaterial(@PathVariable String id) {
    try {
        System.out.println("📥 Downloading material: " + id);
        
        MaterialResponse material = materialService.getMaterialById(id);
        
        if (material.getFileUrl() == null || material.getFileUrl().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("No file available for download", "/api/materials/" + id + "/download"));
        }
        
        // ✅ Use HttpURLConnection to download from Cloudinary
        java.net.URL url = new java.net.URL(material.getFileUrl());
        java.net.HttpURLConnection connection = (java.net.HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(5000);
        connection.setReadTimeout(10000);
        
        // Get file data
        byte[] fileData = connection.getInputStream().readAllBytes();
        
        // Get file name
        String fileName = material.getFileName() != null ? material.getFileName() : "download";
        
        // Determine content type
        String contentType = "application/octet-stream";
        if (fileName.endsWith(".pdf")) contentType = "application/pdf";
        else if (fileName.endsWith(".ppt") || fileName.endsWith(".pptx")) contentType = "application/vnd.ms-powerpoint";
        else if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) contentType = "application/msword";
        else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (fileName.endsWith(".png")) contentType = "image/png";
        
        return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                .body(fileData);
                
    } catch (Exception e) {
        System.err.println("❌ Download error: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Download failed: " + e.getMessage(), "/api/materials/" + id + "/download"));
    }
}
    @GetMapping
    public ResponseEntity<ApiResponse> getAllMaterials(
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String subjectId,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) Integer academicYear,
            @RequestParam(required = false) Integer joiningYear,
            @RequestParam(required = false) String regulation,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        try {
            List<MaterialResponse> materials;
            if (search != null && !search.isEmpty()) {
                materials = materialService.searchMaterials(search, departmentId, subjectId, semester);
            } else if (departmentId != null && subjectId != null && semester != null) {
                materials = materialService.getMaterialsByCurriculum(departmentId, null, null, null, semester);
            } else {
                materials = materialService.getAllMaterials();
            }

            if (departmentId != null && !departmentId.trim().isEmpty()) {
                Department dept = departmentRepository.findById(departmentId).orElse(null);
                if (dept == null) {
                    dept = departmentRepository.findAll().stream()
                            .filter(d -> (d.getCode() != null && d.getCode().equalsIgnoreCase(departmentId)) ||
                                         (d.getName() != null && d.getName().equalsIgnoreCase(departmentId)))
                            .findFirst().orElse(null);
                }
                final Department finalDept = dept;
                materials = materials.stream()
                        .filter(m -> {
                            if (m.getDepartmentId() != null && (m.getDepartmentId().equalsIgnoreCase(departmentId) || 
                                (finalDept != null && (m.getDepartmentId().equalsIgnoreCase(finalDept.getId()) || 
                                                       m.getDepartmentId().equalsIgnoreCase(finalDept.getCode()) || 
                                                       m.getDepartmentId().equalsIgnoreCase(finalDept.getName()))))) {
                                return true;
                            }
                            if (m.getDepartmentName() != null && (m.getDepartmentName().equalsIgnoreCase(departmentId) || 
                                (finalDept != null && (m.getDepartmentName().equalsIgnoreCase(finalDept.getName()) || 
                                                       m.getDepartmentName().equalsIgnoreCase(finalDept.getCode()))))) {
                                return true;
                            }
                            return false;
                        })
                        .collect(java.util.stream.Collectors.toList());
            }
            if (subjectId != null && !subjectId.trim().isEmpty()) {
                materials = materials.stream()
                        .filter(m -> subjectId.equalsIgnoreCase(m.getSubjectId()) || 
                                     (m.getSubject() != null && m.getSubject().equalsIgnoreCase(subjectId)) ||
                                     (m.getSubjectName() != null && m.getSubjectName().equalsIgnoreCase(subjectId)))
                        .collect(java.util.stream.Collectors.toList());
            }
            if (semester != null) {
                materials = materials.stream()
                        .filter(m -> semester.equals(m.getSemester()))
                        .collect(java.util.stream.Collectors.toList());
            }
            if (academicYear != null) {
                materials = materials.stream()
                        .filter(m -> m.getAcademicYear() == null || academicYear.equals(m.getAcademicYear()))
                        .collect(java.util.stream.Collectors.toList());
            }
            if (joiningYear != null) {
                materials = materials.stream()
                        .filter(m -> m.getJoiningYear() == null || joiningYear.equals(m.getJoiningYear()))
                        .collect(java.util.stream.Collectors.toList());
            }
            if (regulation != null && !regulation.trim().isEmpty()) {
                materials = materials.stream()
                        .filter(m -> m.getRegulationName() == null || 
                                     m.getRegulationName().equalsIgnoreCase(regulation.trim()) ||
                                     (m.getRegulationId() != null && m.getRegulationId().equalsIgnoreCase(regulation.trim())))
                        .collect(java.util.stream.Collectors.toList());
            }
            if (type != null && !type.trim().isEmpty()) {
                String targetType = type.trim().toUpperCase();
                materials = materials.stream()
                        .filter(m -> {
                            if (m.getType() == null) return false;
                            String mType = m.getType().toUpperCase();
                            if (targetType.equals("VIDEO") || targetType.equals("YOUTUBE")) {
                                return mType.contains("VIDEO") || mType.contains("YOUTUBE") || (m.getYouTubeUrl() != null && !m.getYouTubeUrl().isEmpty());
                            }
                            if (targetType.equals("PDF")) {
                                return mType.contains("PDF");
                            }
                            if (targetType.equals("PPT") || targetType.equals("PPTX")) {
                                return mType.contains("PPT");
                            }
                            if (targetType.equals("DOC") || targetType.equals("DOCX")) {
                                return mType.contains("DOC");
                            }
                            return mType.equalsIgnoreCase(targetType);
                        })
                        .collect(java.util.stream.Collectors.toList());
            }

            return ResponseEntity.ok(ApiResponse.success("Materials retrieved", materials, "/api/materials"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve materials: " + e.getMessage(), "/api/materials"));
        }
    }

    @GetMapping("/my-materials")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getMyMaterials(
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            String userId = getUserIdFromToken(token);
            List<MaterialResponse> materials = materialService.getMaterialsByTeacher(userId);
            return ResponseEntity.ok(ApiResponse.success("Your materials retrieved", materials, "/api/materials/my-materials"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve materials: " + e.getMessage(), "/api/materials/my-materials"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getMaterialById(@PathVariable String id) {
        try {
            MaterialResponse material = materialService.getMaterialById(id);
            return ResponseEntity.ok(ApiResponse.success("Material retrieved", material, "/api/materials/" + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve material: " + e.getMessage(), "/api/materials/" + id));
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse> updateMaterial(
            @PathVariable String id,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("department") String department,
            @RequestParam("departmentId") String departmentId,
            @RequestParam("joiningYear") String joiningYear,
            @RequestParam("academicYear") String academicYear,
            @RequestParam("semester") String semester,
            @RequestParam(value = "regulation", required = false) String regulation,
            @RequestParam(value = "regulationId", required = false) String regulationId,
            @RequestParam(value = "regulationName", required = false) String regulationName,
            @RequestParam("subjectId") String subjectId,
            @RequestParam("subjectName") String subjectName,
            @RequestParam("type") String type,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "youTubeUrl", required = false) String youTubeUrl,
            @RequestHeader(value = "Authorization", required = false) String token) {

        try {
            String userId = getUserIdFromToken(token);

            MaterialRequest request = new MaterialRequest();
            request.setTitle(title);
            request.setDescription(description);
            request.setDepartment(department);
            request.setDepartmentId(departmentId);
            request.setJoiningYear(Integer.parseInt(joiningYear));
            request.setAcademicYear(Integer.parseInt(academicYear));
            request.setSemester(Integer.parseInt(semester));
            request.setRegulation(regulation != null ? regulation : regulationName);
            request.setRegulationId(regulationId);
            request.setRegulationName(regulationName != null ? regulationName : regulation);
            request.setSubjectId(subjectId);
            request.setSubjectName(subjectName);
            request.setType(type);
            request.setYouTubeUrl(youTubeUrl);
            request.setFileName(file != null ? file.getOriginalFilename() : null);

            MaterialResponse response = materialService.updateMaterial(id, request, file, userId);
            return ResponseEntity.ok(ApiResponse.success("Material updated", response, "/api/materials/" + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update material: " + e.getMessage(), "/api/materials/" + id));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse> deleteMaterial(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            String userId = getUserIdFromToken(token);
            String userRole = getUserRoleFromToken(token);
            materialService.deleteMaterial(id, userId, userRole);
            return ResponseEntity.ok(ApiResponse.success("Material deleted", null, "/api/materials/" + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete material: " + e.getMessage(), "/api/materials/" + id));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getStats() {
        try {
            List<MaterialResponse> allMaterials = materialService.getAllMaterials();
            long total = allMaterials.size();
            long active = allMaterials.stream().filter(m -> "ACTIVE".equals(m.getStatus())).count();
            long blocked = allMaterials.stream().filter(m -> "BLOCKED".equals(m.getStatus())).count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("total", total);
            stats.put("active", active);
            stats.put("blocked", blocked);
            stats.put("byType", allMaterials.stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                            MaterialResponse::getType,
                            java.util.stream.Collectors.counting()
                    )));

            return ResponseEntity.ok(ApiResponse.success("Stats retrieved", stats, "/api/materials/stats"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get stats: " + e.getMessage(), "/api/materials/stats"));
        }
    }

    private String getUserIdFromToken(String token) {
        if (token == null || token.isEmpty()) {
            throw new RuntimeException("Authorization token is required");
        }
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return user.getId();
    }

    private String getUserRoleFromToken(String token) {
        if (token == null || token.isEmpty()) {
            return "";
        }
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        try {
            return jwtTokenProvider.getRoleFromToken(token);
        } catch (Exception e) {
            return "";
        }
    }
}