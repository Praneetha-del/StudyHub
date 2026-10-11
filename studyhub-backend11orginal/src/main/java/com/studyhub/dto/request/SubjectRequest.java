// SubjectRequest.java
package com.studyhub.dto.request;

public class SubjectRequest {
    private String subjectName;
    private String description;
    private String department;

    public SubjectRequest() {}

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}