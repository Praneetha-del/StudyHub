package com.studyhub.dto.response;

import java.util.List;

public class SubjectResponse {
    private String curriculumId;
    private String departmentId;
    private String departmentName;
    private String regulationId;
    private String regulationName;
    private Integer joiningYear;
    private Integer academicYear;
    private Integer semester;
    private List<SubjectInfo> subjects;

    public SubjectResponse() {
    }

    public SubjectResponse(String curriculumId, String departmentId, String departmentName, 
                          String regulationId, String regulationName, Integer joiningYear, 
                          Integer academicYear, Integer semester, List<SubjectInfo> subjects) {
        this.curriculumId = curriculumId;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.regulationId = regulationId;
        this.regulationName = regulationName;
        this.joiningYear = joiningYear;
        this.academicYear = academicYear;
        this.semester = semester;
        this.subjects = subjects;
    }

    // Getters and Setters
    public String getCurriculumId() {
        return curriculumId;
    }

    public void setCurriculumId(String curriculumId) {
        this.curriculumId = curriculumId;
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

    public List<SubjectInfo> getSubjects() {
        return subjects;
    }

    public void setSubjects(List<SubjectInfo> subjects) {
        this.subjects = subjects;
    }

    public static class SubjectInfo {
        private String id;
        private String name;
        private String description;

        public SubjectInfo() {
        }

        public SubjectInfo(String id, String name, String description) {
            this.id = id;
            this.name = name;
            this.description = description;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}