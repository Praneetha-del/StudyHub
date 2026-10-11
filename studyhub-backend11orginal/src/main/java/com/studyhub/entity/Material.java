package com.studyhub.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "materials")
public class Material {

    @Id
    private String id;
    private String title;
    private String description;
    private String subject;          // ✅ Existing field - keep this
    private String year;             // ✅ Existing field - keep this
    private Integer semester;
    private String type;
    private String fileUrl;
    private String filePublicId;
    private String fileName;
    private Long fileSize;
    private String youTubeUrl;
    private String videoTitle;
    private String uploadedBy;        // ✅ Existing field - keep this
    private String uploadedByName;
    private String uploadedByEmail;
    private String status;
    private String adminNotes;
    private String blockedBy;         // ✅ Keep this
    private LocalDateTime blockedAt;  // ✅ Keep this
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ===== NEW FIELDS for Curriculum Support =====
    private String subjectId;
    private String subjectName;
    private String departmentId;
    private String departmentName;
    private String regulationId;
    private String regulationName;
    private Integer joiningYear;
    private Integer academicYear;
    private String curriculumId;

    public Material() {
        this.status = "ACTIVE";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // ===== GETTERS =====
    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getSubject() { return subject; }
    public String getYear() { return year; }
    public Integer getSemester() { return semester; }
    public String getType() { return type; }
    public String getFileUrl() { return fileUrl; }
    public String getFilePublicId() { return filePublicId; }
    public String getFileName() { return fileName; }
    public Long getFileSize() { return fileSize; }
    public String getYouTubeUrl() { return youTubeUrl; }
    public String getVideoTitle() { return videoTitle; }
    public String getUploadedBy() { return uploadedBy; }
    public String getUploadedByName() { return uploadedByName; }
    public String getUploadedByEmail() { return uploadedByEmail; }
    public String getStatus() { return status; }
    public String getAdminNotes() { return adminNotes; }
    public String getBlockedBy() { return blockedBy; }
    public LocalDateTime getBlockedAt() { return blockedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // ===== NEW GETTERS =====
    public String getDepartment() { return departmentName != null ? departmentName : (departmentId != null ? departmentId : ""); }
    public String getSubjectId() { return subjectId; }
    public String getSubjectName() { return subjectName; }
    public String getDepartmentId() { return departmentId; }
    public String getDepartmentName() { return departmentName; }
    public String getRegulationId() { return regulationId; }
    public String getRegulationName() { return regulationName; }
    public Integer getJoiningYear() { return joiningYear; }
    public Integer getAcademicYear() { return academicYear; }
    public String getCurriculumId() { return curriculumId; }

    // ===== SETTERS =====
    public void setDepartment(String department) { this.departmentName = department; }
    public void setId(String id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setSubject(String subject) { this.subject = subject; }
    public void setYear(String year) { this.year = year; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public void setType(String type) { this.type = type; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public void setFilePublicId(String filePublicId) { this.filePublicId = filePublicId; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public void setYouTubeUrl(String youTubeUrl) { this.youTubeUrl = youTubeUrl; }
    public void setVideoTitle(String videoTitle) { this.videoTitle = videoTitle; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }
    public void setUploadedByEmail(String uploadedByEmail) { this.uploadedByEmail = uploadedByEmail; }
    public void setStatus(String status) { this.status = status; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
    public void setBlockedBy(String blockedBy) { this.blockedBy = blockedBy; }
    public void setBlockedAt(LocalDateTime blockedAt) { this.blockedAt = blockedAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // ===== NEW SETTERS =====
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public void setRegulationId(String regulationId) { this.regulationId = regulationId; }
    public void setRegulationName(String regulationName) { this.regulationName = regulationName; }
    public void setJoiningYear(Integer joiningYear) { this.joiningYear = joiningYear; }
    public void setAcademicYear(Integer academicYear) { this.academicYear = academicYear; }
    public void setCurriculumId(String curriculumId) { this.curriculumId = curriculumId; }
}