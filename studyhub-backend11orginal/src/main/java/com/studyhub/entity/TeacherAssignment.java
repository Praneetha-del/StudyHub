package com.studyhub.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "teacher_assignments")
public class TeacherAssignment {

    @Id
    private String id;

    // Teacher Details
    private String teacherId;
    private String teacherName;
    private String teacherEmail;
    private String teacherEmployeeId;

    // Department Details (Teacher can be assigned to any department)
    private String departmentId;
    private String departmentName;

    // Subject Details
    private String subjectId;
    private String subjectName;

    // Academic & Curriculum Details
    private Integer joiningYear;
    private Integer academicYear;
    private Integer semester;
    private String regulationId;
    private String regulationName;

    private Boolean active = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TeacherAssignment() {
        this.active = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public TeacherAssignment(String teacherId, String teacherName, String teacherEmail,
                             String departmentId, String departmentName,
                             String subjectId, String subjectName,
                             Integer academicYear, Integer semester, String regulationName) {
        this.teacherId = teacherId;
        this.teacherName = teacherName;
        this.teacherEmail = teacherEmail;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.subjectId = subjectId;
        this.subjectName = subjectName;
        this.academicYear = academicYear;
        this.semester = semester;
        this.regulationName = regulationName;
        this.active = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // ===== Getters and Setters =====

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(String teacherId) {
        this.teacherId = teacherId;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getTeacherEmail() {
        return teacherEmail;
    }

    public void setTeacherEmail(String teacherEmail) {
        this.teacherEmail = teacherEmail;
    }

    public String getTeacherEmployeeId() {
        return teacherEmployeeId;
    }

    public void setTeacherEmployeeId(String teacherEmployeeId) {
        this.teacherEmployeeId = teacherEmployeeId;
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
