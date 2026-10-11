package com.studyhub.serviceImpl;

import com.studyhub.dto.request.MaterialRequest;
import com.studyhub.dto.response.MaterialResponse;
import com.studyhub.entity.Curriculum;
import com.studyhub.entity.Department;
import com.studyhub.entity.Material;
import com.studyhub.entity.Subject;
import com.studyhub.entity.User;
import com.studyhub.exception.ResourceNotFoundException;
import com.studyhub.exception.ForbiddenException;
import com.studyhub.repository.CurriculumRepository;
import com.studyhub.repository.DepartmentRepository;
import com.studyhub.repository.MaterialRepository;
import com.studyhub.repository.SubjectRepository;
import com.studyhub.repository.UserRepository;
import com.studyhub.service.FileStorageService;
import com.studyhub.service.MaterialService;
import com.studyhub.validator.FileValidator;
import com.studyhub.validator.YouTubeUrlValidator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MaterialServiceImpl implements MaterialService {

    private final MaterialRepository materialRepository;
    private final CurriculumRepository curriculumRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final FileStorageService fileStorageService;
    private final FileValidator fileValidator;
    private final YouTubeUrlValidator youTubeUrlValidator;

    public MaterialServiceImpl(MaterialRepository materialRepository,
                               CurriculumRepository curriculumRepository,
                               SubjectRepository subjectRepository,
                               UserRepository userRepository,
                               DepartmentRepository departmentRepository,
                               FileStorageService fileStorageService,
                               FileValidator fileValidator,
                               YouTubeUrlValidator youTubeUrlValidator) {
        this.materialRepository = materialRepository;
        this.curriculumRepository = curriculumRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.fileStorageService = fileStorageService;
        this.fileValidator = fileValidator;
        this.youTubeUrlValidator = youTubeUrlValidator;
    }

    @Override
    @Transactional
    public MaterialResponse uploadMaterial(MaterialRequest request, MultipartFile file,
                                          String userId, String userEmail, String userName) {

        System.out.println("========================================");
        System.out.println("📝 UPLOAD MATERIAL");
        System.out.println("  User: " + userEmail);
        System.out.println("  DepartmentId: " + request.getDepartmentId());
        System.out.println("  JoiningYear: " + request.getJoiningYear());
        System.out.println("  AcademicYear: " + request.getAcademicYear());
        System.out.println("  Semester: " + request.getSemester());
        System.out.println("  SubjectId: " + request.getSubjectId());
        System.out.println("  SubjectName: " + request.getSubjectName());
        System.out.println("========================================");

        // ✅ Validate file
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        // ✅ Validate file type
        String fileName = file.getOriginalFilename();
        if (fileName != null) {
            String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
            if (!extension.matches("pdf|ppt|pptx|doc|docx|txt|jpg|jpeg|png")) {
                throw new IllegalArgumentException("Invalid file type. Allowed: PDF, PPT, DOC, TXT, JPG, PNG");
            }
        }

        // ✅ Validate file size (50MB max)
        if (file.getSize() > 50 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 50MB limit");
        }

        // ✅ Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // ✅ FIND CURRICULUM
        Curriculum curriculum = findCurriculumByDepartmentAndYearAndSemester(
                request.getDepartmentId(),
                request.getJoiningYear(),
                request.getAcademicYear(),
                request.getSemester()
        );

        System.out.println("✅ Found curriculum: " + curriculum.getId());
        System.out.println("  Department: " + curriculum.getDepartmentName());
        System.out.println("  DepartmentId: " + curriculum.getDepartmentId());
        System.out.println("  Subjects: " + curriculum.getSubjectNames());

        // ✅ Get subject
        Subject subject = findOrCreateSubject(
                request.getSubjectId(),
                request.getSubjectName(),
                curriculum
        );

        // ✅ Upload file to Cloudinary
        String fileUrl = null;
        String filePublicId = null;
        try {
            fileUrl = fileStorageService.uploadFile(file, "materials");
            filePublicId = extractPublicIdFromUrl(fileUrl);
            System.out.println("✅ File uploaded: " + fileUrl);
        } catch (Exception e) {
            System.err.println("❌ File upload failed: " + e.getMessage());
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }

        // ✅ Create material
        Material material = new Material();
        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setSubject(subject.getSubjectName());
        material.setSubjectId(subject.getId());
        material.setSubjectName(subject.getSubjectName());
        material.setDepartmentId(curriculum.getDepartmentId());
        material.setDepartmentName(curriculum.getDepartmentName());
        material.setJoiningYear(curriculum.getJoiningYear());
        material.setAcademicYear(curriculum.getAcademicYear());
        material.setSemester(curriculum.getSemester());
        material.setCurriculumId(curriculum.getId());
        material.setRegulationId(request.getRegulationId() != null ? request.getRegulationId() : curriculum.getRegulationId());
        material.setRegulationName(request.getRegulationName() != null ? request.getRegulationName() : (request.getRegulation() != null ? request.getRegulation() : curriculum.getRegulationName()));
        material.setType(request.getType());
        material.setFileUrl(fileUrl);
        material.setFilePublicId(filePublicId);
        material.setFileName(file.getOriginalFilename());
        material.setFileSize(file.getSize());
        material.setUploadedBy(userId);
        material.setUploadedByName(userName);
        material.setUploadedByEmail(userEmail);
        material.setStatus("ACTIVE");
        material.setCreatedAt(LocalDateTime.now());
        material.setUpdatedAt(LocalDateTime.now());

        Material savedMaterial = materialRepository.save(material);
        System.out.println("✅ Material saved with ID: " + savedMaterial.getId());
        System.out.println("========================================");

        return convertToResponse(savedMaterial);
    }

    @Override
    @Transactional
    public MaterialResponse uploadYouTubeMaterial(MaterialRequest request, String userId,
                                                 String userEmail, String userName) {

        System.out.println("========================================");
        System.out.println("📝 UPLOAD YOUTUBE MATERIAL");
        System.out.println("  User: " + userEmail);
        System.out.println("  DepartmentId: " + request.getDepartmentId());
        System.out.println("  JoiningYear: " + request.getJoiningYear());
        System.out.println("  AcademicYear: " + request.getAcademicYear());
        System.out.println("  Semester: " + request.getSemester());
        System.out.println("========================================");

        // ✅ Validate YouTube URL
        if (request.getYouTubeUrl() == null || request.getYouTubeUrl().isEmpty()) {
            throw new IllegalArgumentException("YouTube URL is required");
        }

        if (!youTubeUrlValidator.isValid(request.getYouTubeUrl())) {
            throw new IllegalArgumentException("Invalid YouTube URL format");
        }

        // ✅ Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // ✅ FIND CURRICULUM
        Curriculum curriculum = findCurriculumByDepartmentAndYearAndSemester(
                request.getDepartmentId(),
                request.getJoiningYear(),
                request.getAcademicYear(),
                request.getSemester()
        );

        // ✅ Get subject
        Subject subject = findOrCreateSubject(
                request.getSubjectId(),
                request.getSubjectName(),
                curriculum
        );

        String videoTitle = extractVideoTitleFromUrl(request.getYouTubeUrl());

        // ✅ Create material
        Material material = new Material();
        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setSubject(subject.getSubjectName());
        material.setSubjectId(subject.getId());
        material.setSubjectName(subject.getSubjectName());
        material.setDepartmentId(curriculum.getDepartmentId());
        material.setDepartmentName(curriculum.getDepartmentName());
        material.setJoiningYear(curriculum.getJoiningYear());
        material.setAcademicYear(curriculum.getAcademicYear());
        material.setSemester(curriculum.getSemester());
        material.setCurriculumId(curriculum.getId());
        material.setRegulationId(request.getRegulationId() != null ? request.getRegulationId() : curriculum.getRegulationId());
        material.setRegulationName(request.getRegulationName() != null ? request.getRegulationName() : (request.getRegulation() != null ? request.getRegulation() : curriculum.getRegulationName()));
        material.setType("VIDEO");
        material.setYouTubeUrl(request.getYouTubeUrl());
        material.setVideoTitle(videoTitle);
        material.setUploadedBy(userId);
        material.setUploadedByName(userName);
        material.setUploadedByEmail(userEmail);
        material.setStatus("ACTIVE");
        material.setCreatedAt(LocalDateTime.now());
        material.setUpdatedAt(LocalDateTime.now());

        Material savedMaterial = materialRepository.save(material);
        System.out.println("✅ YouTube material saved with ID: " + savedMaterial.getId());
        System.out.println("========================================");

        return convertToResponse(savedMaterial);
    }

    // ✅ THIS IS THE CRITICAL METHOD - MAKE SURE IT'S IN YOUR FILE!
private Curriculum findCurriculumByDepartmentAndYearAndSemester(
        String departmentId, Integer joiningYear, Integer academicYear, Integer semester) {

    // Get ALL curriculums
    List<Curriculum> allCurriculums = curriculumRepository.findAll();

    Department dept = null;
    if (departmentId != null && !departmentId.trim().isEmpty()) {
        dept = departmentRepository.findById(departmentId).orElse(null);
        if (dept == null) {
            dept = departmentRepository.findAll().stream()
                    .filter(d -> (d.getCode() != null && d.getCode().equalsIgnoreCase(departmentId)) ||
                                 (d.getName() != null && d.getName().equalsIgnoreCase(departmentId)))
                    .findFirst().orElse(null);
        }
    }
    final Department finalDept = dept;
    final String cleanDeptId = departmentId != null ? departmentId.trim() : null;

    // Filter curriculums for department
    List<Curriculum> deptCurriculums = allCurriculums.stream()
            .filter(c -> {
                if (cleanDeptId == null && finalDept == null) return true;
                boolean match = false;
                if (c.getDepartmentId() != null) {
                    match = (cleanDeptId != null && c.getDepartmentId().equalsIgnoreCase(cleanDeptId))
                         || (finalDept != null && (c.getDepartmentId().equalsIgnoreCase(finalDept.getId()) 
                             || c.getDepartmentId().equalsIgnoreCase(finalDept.getCode()) 
                             || c.getDepartmentId().equalsIgnoreCase(finalDept.getName())));
                }
                if (!match && c.getDepartmentName() != null) {
                    match = (cleanDeptId != null && c.getDepartmentName().equalsIgnoreCase(cleanDeptId))
                         || (finalDept != null && (c.getDepartmentName().equalsIgnoreCase(finalDept.getName()) 
                             || c.getDepartmentName().equalsIgnoreCase(finalDept.getCode())));
                }
                return match;
            })
            .collect(Collectors.toList());

    if (deptCurriculums.isEmpty()) {
        deptCurriculums = allCurriculums;
    }

    // STRATEGY 1: EXACT MATCH (joiningYear + academicYear + semester)
    Curriculum matchingCurriculum = null;
    if (joiningYear != null && academicYear != null && semester != null) {
        matchingCurriculum = deptCurriculums.stream()
                .filter(c -> c.getJoiningYear() != null && c.getJoiningYear().intValue() == joiningYear.intValue())
                .filter(c -> c.getAcademicYear() != null && c.getAcademicYear().intValue() == academicYear.intValue())
                .filter(c -> c.getSemester() != null && c.getSemester().intValue() == semester.intValue())
                .findFirst().orElse(null);
    }

    // STRATEGY 2: WITHOUT ACADEMIC YEAR (joiningYear + semester)
    if (matchingCurriculum == null && joiningYear != null && semester != null) {
        matchingCurriculum = deptCurriculums.stream()
                .filter(c -> c.getJoiningYear() != null && c.getJoiningYear().intValue() == joiningYear.intValue())
                .filter(c -> c.getSemester() != null && c.getSemester().intValue() == semester.intValue())
                .findFirst().orElse(null);
    }

    // STRATEGY 3: ACADEMIC YEAR + SEMESTER ONLY
    if (matchingCurriculum == null && academicYear != null && semester != null) {
        matchingCurriculum = deptCurriculums.stream()
                .filter(c -> c.getAcademicYear() != null && c.getAcademicYear().intValue() == academicYear.intValue())
                .filter(c -> c.getSemester() != null && c.getSemester().intValue() == semester.intValue())
                .findFirst().orElse(null);
    }

    // STRATEGY 4: SEMESTER ONLY
    if (matchingCurriculum == null && semester != null) {
        matchingCurriculum = deptCurriculums.stream()
                .filter(c -> c.getSemester() != null && c.getSemester().intValue() == semester.intValue())
                .findFirst().orElse(null);
    }

    // STRATEGY 5: FIRST MATCHING IN DEPARTMENT
    if (matchingCurriculum == null && !deptCurriculums.isEmpty()) {
        matchingCurriculum = deptCurriculums.get(0);
    }

    if (matchingCurriculum != null) {
        return matchingCurriculum;
    }

    throw new ResourceNotFoundException(
        "No curriculum found for Department ID: '" + departmentId + 
        "', Joining Year: " + joiningYear + 
        ", Academic Year: " + academicYear + 
        ", Semester: " + semester
    );
}

    // ✅ FIND OR CREATE SUBJECT
    private Subject findOrCreateSubject(String subjectId, String subjectName, Curriculum curriculum) {
        Subject subject = null;

        if (subjectId != null && !subjectId.isEmpty()) {
            try {
                subject = subjectRepository.findById(subjectId).orElse(null);
                if (subject != null) {
                    System.out.println("✅ Found subject by ID: " + subject.getSubjectName());
                    return subject;
                }
            } catch (Exception e) {
                System.out.println("⚠️ Subject ID lookup failed: " + e.getMessage());
            }
        }

        if (subjectName != null && !subjectName.isEmpty()) {
            List<Subject> allSubjects = subjectRepository.findAll();
            subject = allSubjects.stream()
                    .filter(s -> s.getSubjectName() != null && 
                                s.getSubjectName().equalsIgnoreCase(subjectName.trim()))
                    .findFirst()
                    .orElse(null);
            if (subject != null) {
                System.out.println("✅ Found subject by name: " + subject.getSubjectName());
                return subject;
            }
        }

        System.out.println("📝 Creating new subject: " + subjectName);
        subject = new Subject();
        subject.setSubjectName(subjectName != null ? subjectName.trim() : "Unknown Subject");
        subject.setDescription("Auto-created subject for " + curriculum.getDepartmentName());
        subject.setDepartment(curriculum.getDepartmentName());
        subject.setDepartmentId(curriculum.getDepartmentId());
        subject.setActive(true);
        subject.setCreatedAt(LocalDateTime.now());
        subject.setUpdatedAt(LocalDateTime.now());
        subject = subjectRepository.save(subject);
        System.out.println("✅ Created new subject: " + subject.getSubjectName() + " (ID: " + subject.getId() + ")");

        return subject;
    }

    @Override
    public List<MaterialResponse> getAllMaterials() {
        return materialRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MaterialResponse getMaterialById(String id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));
        return convertToResponse(material);
    }

    @Override
    @Transactional
    public MaterialResponse updateMaterial(String id, MaterialRequest request, MultipartFile file, String userId) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));

        if (!material.getUploadedBy().equals(userId)) {
            throw new ForbiddenException("You can only update your own materials");
        }

        Curriculum curriculum = findCurriculumByDepartmentAndYearAndSemester(
                request.getDepartmentId(),
                request.getJoiningYear(),
                request.getAcademicYear(),
                request.getSemester()
        );

        if (file != null && !file.isEmpty()) {
            fileValidator.validateFile(file);
            if (material.getFilePublicId() != null) {
                fileStorageService.deleteFile(material.getFilePublicId());
            }
            String newFileUrl = fileStorageService.uploadFile(file, "materials");
            String newFilePublicId = extractPublicIdFromUrl(newFileUrl);
            material.setFileUrl(newFileUrl);
            material.setFilePublicId(newFilePublicId);
            material.setFileSize(file.getSize());
            material.setFileName(request.getFileName());
        }

        Subject subject = findOrCreateSubject(
                request.getSubjectId(),
                request.getSubjectName(),
                curriculum
        );

        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setSubject(subject.getSubjectName());
        material.setSubjectId(subject.getId());
        material.setSubjectName(subject.getSubjectName());
        material.setDepartmentId(curriculum.getDepartmentId());
        material.setDepartmentName(curriculum.getDepartmentName());
        material.setJoiningYear(curriculum.getJoiningYear());
        material.setAcademicYear(curriculum.getAcademicYear());
        material.setSemester(curriculum.getSemester());
        material.setCurriculumId(curriculum.getId());
        material.setRegulationId(request.getRegulationId() != null ? request.getRegulationId() : curriculum.getRegulationId());
        material.setRegulationName(request.getRegulationName() != null ? request.getRegulationName() : (request.getRegulation() != null ? request.getRegulation() : curriculum.getRegulationName()));
        material.setType(request.getType());
        material.setUpdatedAt(LocalDateTime.now());

        Material updatedMaterial = materialRepository.save(material);
        return convertToResponse(updatedMaterial);
    }

    @Override
    @Transactional
    public void deleteMaterial(String id, String userId, String userRole) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));

        if (!material.getUploadedBy().equals(userId) && !"ROLE_ADMIN".equals(userRole)) {
            throw new ForbiddenException("You can only delete your own materials");
        }

        if (material.getFilePublicId() != null) {
            fileStorageService.deleteFile(material.getFilePublicId());
        }
        materialRepository.delete(material);
    }

    @Override
    public List<MaterialResponse> getMaterialsByTeacher(String userId) {
        return materialRepository.findByUploadedBy(userId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialResponse> getMaterialsByCurriculum(String departmentId, String regulationId,
                                                           Integer joiningYear, Integer academicYear,
                                                           Integer semester) {
        List<Material> materials = materialRepository.findByDepartmentIdAndSemester(departmentId, semester);
        return materials.stream()
                .filter(m -> "ACTIVE".equals(m.getStatus()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MaterialResponse blockMaterial(String id, String adminId, String adminNotes) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));

        material.setStatus("BLOCKED");
        material.setBlockedBy(adminId);
        material.setBlockedAt(LocalDateTime.now());
        material.setAdminNotes(adminNotes);
        material.setUpdatedAt(LocalDateTime.now());

        Material blockedMaterial = materialRepository.save(material);
        return convertToResponse(blockedMaterial);
    }

    @Override
    @Transactional
    public MaterialResponse unblockMaterial(String id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));

        material.setStatus("ACTIVE");
        material.setBlockedBy(null);
        material.setBlockedAt(null);
        material.setAdminNotes(null);
        material.setUpdatedAt(LocalDateTime.now());

        Material unblockedMaterial = materialRepository.save(material);
        return convertToResponse(unblockedMaterial);
    }

    @Override
    public List<MaterialResponse> searchMaterials(String query, String departmentId,
                                                  String subjectId, Integer semester) {
        List<Material> materials = materialRepository.findAll();

        Department dept = null;
        if (departmentId != null && !departmentId.trim().isEmpty()) {
            dept = departmentRepository.findById(departmentId).orElse(null);
            if (dept == null) {
                dept = departmentRepository.findAll().stream()
                        .filter(d -> (d.getCode() != null && d.getCode().equalsIgnoreCase(departmentId)) ||
                                     (d.getName() != null && d.getName().equalsIgnoreCase(departmentId)))
                        .findFirst().orElse(null);
            }
        }
        final Department finalDept = dept;

        return materials.stream()
                .filter(m -> "ACTIVE".equals(m.getStatus()))
                .filter(m -> {
                    if (query == null || query.trim().isEmpty()) return true;
                    String q = query.toLowerCase().trim();
                    return (m.getTitle() != null && m.getTitle().toLowerCase().contains(q)) ||
                           (m.getDescription() != null && m.getDescription().toLowerCase().contains(q)) ||
                           (m.getSubject() != null && m.getSubject().toLowerCase().contains(q)) ||
                           (m.getSubjectName() != null && m.getSubjectName().toLowerCase().contains(q));
                })
                .filter(m -> {
                    if (departmentId == null || departmentId.trim().isEmpty()) return true;
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
                    if (m.getDepartment() != null && (m.getDepartment().equalsIgnoreCase(departmentId) || 
                        (finalDept != null && (m.getDepartment().equalsIgnoreCase(finalDept.getName()) || 
                                               m.getDepartment().equalsIgnoreCase(finalDept.getCode()))))) {
                        return true;
                    }
                    return false;
                })
                .filter(m -> {
                    if (subjectId == null || subjectId.trim().isEmpty()) return true;
                    return subjectId.equalsIgnoreCase(m.getSubjectId()) || 
                           (m.getSubject() != null && m.getSubject().equalsIgnoreCase(subjectId)) ||
                           (m.getSubjectName() != null && m.getSubjectName().equalsIgnoreCase(subjectId));
                })
                .filter(m -> semester == null || semester.equals(m.getSemester()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void validateMaterialBelongsToCurriculum(MaterialRequest request) {
        if (request.getDepartmentId() == null || request.getDepartmentId().isEmpty()) {
            throw new IllegalArgumentException("Department is required");
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

        findCurriculumByDepartmentAndYearAndSemester(
                request.getDepartmentId(),
                request.getJoiningYear(),
                request.getAcademicYear(),
                request.getSemester()
        );
    }

    private String extractPublicIdFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return null;
        }
        try {
            String[] parts = fileUrl.split("/");
            String lastPart = parts[parts.length - 1];
            int dotIndex = lastPart.lastIndexOf(".");
            if (dotIndex > 0) {
                return lastPart.substring(0, dotIndex);
            }
            return lastPart;
        } catch (Exception e) {
            return null;
        }
    }

    private String extractVideoTitleFromUrl(String youTubeUrl) {
        if (youTubeUrl == null || youTubeUrl.isEmpty()) {
            return "YouTube Video";
        }
        try {
            String videoId = null;
            if (youTubeUrl.contains("v=")) {
                String[] parts = youTubeUrl.split("v=");
                if (parts.length > 1) {
                    videoId = parts[1];
                    if (videoId.contains("&")) {
                        videoId = videoId.split("&")[0];
                    }
                }
            } else if (youTubeUrl.contains("youtu.be/")) {
                String[] parts = youTubeUrl.split("youtu.be/");
                if (parts.length > 1) {
                    videoId = parts[1];
                    if (videoId.contains("?")) {
                        videoId = videoId.split("\\?")[0];
                    }
                }
            }
            return videoId != null ? "YouTube Video: " + videoId : "YouTube Video";
        } catch (Exception e) {
            return "YouTube Video";
        }
    }

    private MaterialResponse convertToResponse(Material material) {
        MaterialResponse response = new MaterialResponse();
        response.setId(material.getId());
        response.setTitle(material.getTitle());
        response.setDescription(material.getDescription());
        response.setSubject(material.getSubject());
        response.setSubjectId(material.getSubjectId());
        response.setSubjectName(material.getSubjectName());
        response.setYear(material.getYear());
        response.setJoiningYear(material.getJoiningYear());
        response.setAcademicYear(material.getAcademicYear());
        response.setSemester(material.getSemester());
        response.setType(material.getType());
        response.setFileUrl(material.getFileUrl());
        response.setFileName(material.getFileName());
        response.setFileSize(material.getFileSize());
        response.setYouTubeUrl(material.getYouTubeUrl());
        response.setVideoTitle(material.getVideoTitle());
        response.setUploadedBy(material.getUploadedBy());
        response.setUploadedById(material.getUploadedBy());
        response.setUploadedByName(material.getUploadedByName());
        response.setUploadedByEmail(material.getUploadedByEmail());
        response.setStatus(material.getStatus());
        response.setAdminNotes(material.getAdminNotes());
        response.setDepartmentId(material.getDepartmentId());
        response.setDepartmentName(material.getDepartmentName());
        response.setRegulationId(material.getRegulationId());
        response.setRegulationName(material.getRegulationName());
        response.setCurriculumId(material.getCurriculumId());
        response.setCreatedAt(material.getCreatedAt());
        response.setUpdatedAt(material.getUpdatedAt());
        response.setHasSummary(false);
        return response;
    }
}