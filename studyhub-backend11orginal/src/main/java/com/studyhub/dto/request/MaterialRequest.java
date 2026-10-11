package com.studyhub.dto.request;

import org.springframework.web.multipart.MultipartFile;

public class MaterialRequest {

    private String title;
    private String description;
    private String department;
    private String departmentId;
    private String subjectId;
    private String subjectName;
    private Integer joiningYear;
    private Integer academicYear;
    private Integer semester;
    private String regulation;
    private String regulationId;
    private String regulationName;
    private String type;
    private String youTubeUrl;
    private String fileName;
    private MultipartFile file;

    public MaterialRequest() {
    }

    public MaterialRequest(String title, String description, String department, String departmentId,
                          String subjectId, String subjectName, Integer joiningYear, 
                          Integer academicYear, Integer semester, String type) {
        this.title = title;
        this.description = description;
        this.department = department;
        this.departmentId = departmentId;
        this.subjectId = subjectId;
        this.subjectName = subjectName;
        this.joiningYear = joiningYear;
        this.academicYear = academicYear;
        this.semester = semester;
        this.type = type;
    }

    // ===== GETTERS AND SETTERS =====

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public String getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(String subjectId) {
        this.subjectId = subjectId;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getSubject() {
        return subjectName;
    }

    public void setSubject(String subject) {
        this.subjectName = subject;
    }

    public Integer getJoiningYear() {
        return joiningYear;
    }

    public void setJoiningYear(Integer joiningYear) {
        this.joiningYear = joiningYear;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public String getRegulation() {
        return regulation != null ? regulation : regulationName;
    }

    public void setRegulation(String regulation) {
        this.regulation = regulation;
        this.regulationName = regulation;
    }

    public String getRegulationId() {
        return regulationId;
    }

    public void setRegulationId(String regulationId) {
        this.regulationId = regulationId;
    }

    public String getRegulationName() {
        return regulationName != null ? regulationName : regulation;
    }

    public void setRegulationName(String regulationName) {
        this.regulationName = regulationName;
        this.regulation = regulationName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getYouTubeUrl() {
        return youTubeUrl;
    }

    public void setYouTubeUrl(String youTubeUrl) {
        this.youTubeUrl = youTubeUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public MultipartFile getFile() {
        return file;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }
}