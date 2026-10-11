package com.studyhub.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "curriculums")
public class Curriculum {

    @Id
    private String id;
    
    private String departmentId;
    private String departmentName;
    private String regulationId;
    private String regulationName;
    private Object joiningYear;
    private Object academicYear;
    private Object semester;
    private List<String> subjectIds;
    private List<String> subjectNames;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Curriculum() {}

    // ========== GETTERS AND SETTERS ==========

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getRegulationId() {
        return regulationId;
    }

    public void setRegulationId(String regulationId) {
        this.regulationId = regulationId;
    }

    public String getRegulationName() {
        return regulationName;
    }

    public void setRegulationName(String regulationName) {
        this.regulationName = regulationName;
    }

    public Integer getJoiningYear() {
        if (joiningYear == null) return null;
        if (joiningYear instanceof Number) {
            return ((Number) joiningYear).intValue();
        }
        String str = joiningYear.toString().trim();
        String digits = str.replaceAll("\\D+", "");
        if (!digits.isEmpty()) {
            try {
                return Integer.parseInt(digits);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    public void setJoiningYear(Object joiningYear) {
        this.joiningYear = joiningYear;
    }

    public Integer getAcademicYear() {
        if (academicYear == null) return null;
        if (academicYear instanceof Number) {
            return ((Number) academicYear).intValue();
        }
        String str = academicYear.toString().trim();
        String digits = str.replaceAll("\\D+", "");
        if (!digits.isEmpty()) {
            try {
                return Integer.parseInt(digits);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    public void setAcademicYear(Object academicYear) {
        this.academicYear = academicYear;
    }

    public Integer getSemester() {
        if (semester == null) return null;
        if (semester instanceof Number) {
            return ((Number) semester).intValue();
        }
        String str = semester.toString().trim();
        String digits = str.replaceAll("\\D+", "");
        if (!digits.isEmpty()) {
            try {
                return Integer.parseInt(digits);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    public void setSemester(Object semester) {
        this.semester = semester;
    }

    public List<String> getSubjectIds() {
        return subjectIds;
    }

    public void setSubjectIds(List<String> subjectIds) {
        this.subjectIds = subjectIds;
    }

    public List<String> getSubjectNames() {
        return subjectNames;
    }

    public void setSubjectNames(List<String> subjectNames) {
        this.subjectNames = subjectNames;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}