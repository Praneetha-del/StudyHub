package com.studyhub.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "verification_codes")
public class VerificationCode {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String email;
    
    private String code;
    
    @Indexed(expireAfterSeconds = 300)
    private LocalDateTime expiryDate;
    
    private boolean verified = false;
    
    private String role;
    private String firstName;
    private String lastName;
    private String password;
    private String department;
    private String rollNumber;
    private String employeeId; // ✅ NEW: For teachers
    private String branch;
    private Integer year;
    private Integer semester;
    private Integer joiningYear;
    
    private LocalDateTime createdAt;

    // Constructors
    public VerificationCode() {}

    public VerificationCode(String email, String code, String role, 
                           String firstName, String lastName, String password) {
        this.email = email;
        this.code = code;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        this.expiryDate = LocalDateTime.now().plusMinutes(5);
        this.createdAt = LocalDateTime.now();
        this.verified = false;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
    
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    
    public Integer getJoiningYear() { return joiningYear; }
    public void setJoiningYear(Integer joiningYear) { this.joiningYear = joiningYear; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
}