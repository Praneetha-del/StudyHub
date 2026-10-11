package com.studyhub.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "subjects")
public class Subject {

    @Id
    private String id;
    private String subjectName;
    private String description;
    private String department;
    private String departmentId;
    private Boolean active = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Subject() {
    }

    public Subject(String subjectName, String description, String department) {
        this.subjectName = subjectName;
        this.description = description;
        this.department = department;
        this.active = true;
    }

    // ===== GETTERS AND SETTERS =====

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
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

    @Override
    public String toString() {
        return "Subject{" +
                "id='" + id + '\'' +
                ", subjectName='" + subjectName + '\'' +
                ", department='" + department + '\'' +
                ", departmentId='" + departmentId + '\'' +
                ", active=" + active +
                '}';
    }
}