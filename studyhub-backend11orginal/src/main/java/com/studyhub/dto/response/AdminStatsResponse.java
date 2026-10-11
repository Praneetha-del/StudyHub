package com.studyhub.dto.response;

public class AdminStatsResponse {
    private long totalUsers;
    private long totalTeachers;
    private long totalStudents;
    private long totalMaterials;
    private long totalSubjects;
    private long totalRegulations;
    private long totalDepartments;
    private long totalCurriculums;
    private long pendingTeachers;
    private long activeMaterials;
    private long blockedMaterials;

    public AdminStatsResponse() {}

    // ========== Getters and Setters ==========

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalTeachers() {
        return totalTeachers;
    }

    public void setTotalTeachers(long totalTeachers) {
        this.totalTeachers = totalTeachers;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalMaterials() {
        return totalMaterials;
    }

    public void setTotalMaterials(long totalMaterials) {
        this.totalMaterials = totalMaterials;
    }

    // ✅ ADD THESE - Missing setters
    public long getTotalSubjects() {
        return totalSubjects;
    }

    public void setTotalSubjects(long totalSubjects) {
        this.totalSubjects = totalSubjects;
    }

    public long getTotalRegulations() {
        return totalRegulations;
    }

    public void setTotalRegulations(long totalRegulations) {
        this.totalRegulations = totalRegulations;
    }

    public long getTotalDepartments() {
        return totalDepartments;
    }

    public void setTotalDepartments(long totalDepartments) {
        this.totalDepartments = totalDepartments;
    }

    public long getTotalCurriculums() {
        return totalCurriculums;
    }

    public void setTotalCurriculums(long totalCurriculums) {
        this.totalCurriculums = totalCurriculums;
    }

    public long getPendingTeachers() {
        return pendingTeachers;
    }

    public void setPendingTeachers(long pendingTeachers) {
        this.pendingTeachers = pendingTeachers;
    }

    public long getActiveMaterials() {
        return activeMaterials;
    }

    public void setActiveMaterials(long activeMaterials) {
        this.activeMaterials = activeMaterials;
    }

    public long getBlockedMaterials() {
        return blockedMaterials;
    }

    public void setBlockedMaterials(long blockedMaterials) {
        this.blockedMaterials = blockedMaterials;
    }

    // ✅ ADD Builder Pattern (Optional but helpful)
    public static class Builder {
        private AdminStatsResponse response = new AdminStatsResponse();

        public Builder totalUsers(long totalUsers) {
            response.totalUsers = totalUsers;
            return this;
        }

        public Builder totalTeachers(long totalTeachers) {
            response.totalTeachers = totalTeachers;
            return this;
        }

        public Builder totalStudents(long totalStudents) {
            response.totalStudents = totalStudents;
            return this;
        }

        public Builder totalMaterials(long totalMaterials) {
            response.totalMaterials = totalMaterials;
            return this;
        }

        public Builder totalSubjects(long totalSubjects) {
            response.totalSubjects = totalSubjects;
            return this;
        }

        public Builder totalRegulations(long totalRegulations) {
            response.totalRegulations = totalRegulations;
            return this;
        }

        public Builder totalDepartments(long totalDepartments) {
            response.totalDepartments = totalDepartments;
            return this;
        }

        public Builder totalCurriculums(long totalCurriculums) {
            response.totalCurriculums = totalCurriculums;
            return this;
        }

        public Builder pendingTeachers(long pendingTeachers) {
            response.pendingTeachers = pendingTeachers;
            return this;
        }

        public Builder activeMaterials(long activeMaterials) {
            response.activeMaterials = activeMaterials;
            return this;
        }

        public Builder blockedMaterials(long blockedMaterials) {
            response.blockedMaterials = blockedMaterials;
            return this;
        }

        public AdminStatsResponse build() {
            return response;
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}