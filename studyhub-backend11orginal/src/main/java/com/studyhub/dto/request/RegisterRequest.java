package com.studyhub.dto.request;

public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String role;
    private String department;
    private String departmentId;  // ✅ ADD THIS
    private String rollNumber;
    private String employeeId;
    private String branch;
    private Integer year;
    private Integer semester;
    private Integer joiningYear;

    // Getters and Setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDepartmentId() { return departmentId; }  // ✅ ADDED
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }  // ✅ ADDED

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
}