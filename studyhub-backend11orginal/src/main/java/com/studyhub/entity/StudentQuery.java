package com.studyhub.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "student_queries")
public class StudentQuery {

    @Id
    private String id;

    // Student Details
    private String studentId;
    private String studentName;
    private String studentEmail;
    private String studentRollNumber;

    // Teacher Details
    private String teacherId;
    private String teacherName;
    private String teacherEmail;

    // Subject & Academic Details
    private String department;
    private String departmentId;
    private String academicYear;
    private Integer semester;
    private String subject;
    private String subjectId;
    private String regulation;
    private String regulationId;

    // Query Content
    private String title;
    private String queryText;

    // Reply Content
    private String replyText;
    private String repliedBy;
    private String repliedByName;
    private LocalDateTime repliedAt;

    // Status: PENDING, REPLIED, RESOLVED
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public StudentQuery() {
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getStudentRollNumber() {
        return studentRollNumber;
    }

    public void setStudentRollNumber(String studentRollNumber) {
        this.studentRollNumber = studentRollNumber;
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

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(String subjectId) {
        this.subjectId = subjectId;
    }

    public String getRegulation() {
        return regulation;
    }

    public void setRegulation(String regulation) {
        this.regulation = regulation;
    }

    public String getRegulationId() {
        return regulationId;
    }

    public void setRegulationId(String regulationId) {
        this.regulationId = regulationId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getQueryText() {
        return queryText;
    }

    public void setQueryText(String queryText) {
        this.queryText = queryText;
    }

    public String getReplyText() {
        return replyText;
    }

    public void setReplyText(String replyText) {
        this.replyText = replyText;
    }

    public String getRepliedBy() {
        return repliedBy;
    }

    public void setRepliedBy(String repliedBy) {
        this.repliedBy = repliedBy;
    }

    public String getRepliedByName() {
        return repliedByName;
    }

    public void setRepliedByName(String repliedByName) {
        this.repliedByName = repliedByName;
    }

    public LocalDateTime getRepliedAt() {
        return repliedAt;
    }

    public void setRepliedAt(LocalDateTime repliedAt) {
        this.repliedAt = repliedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
