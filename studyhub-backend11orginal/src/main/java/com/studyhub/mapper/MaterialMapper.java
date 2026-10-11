package com.studyhub.mapper;

import com.studyhub.dto.response.MaterialResponse;
import com.studyhub.entity.Material;
import org.springframework.stereotype.Component;

@Component
public class MaterialMapper {
    
    public MaterialResponse toResponse(Material material) {
        if (material == null) {
            return null;
        }
        
        MaterialResponse response = new MaterialResponse();
        response.setId(material.getId());
        response.setTitle(material.getTitle());
        response.setDescription(material.getDescription());
        
        // Handle both old and new fields
        response.setSubject(material.getSubject() != null ? material.getSubject() : material.getSubjectName());
        response.setSubjectId(material.getSubjectId());
        response.setSubjectName(material.getSubjectName());
        
        // Handle year fields
        response.setYear(material.getYear() != null ? material.getYear() : 
                         (material.getAcademicYear() != null ? String.valueOf(material.getAcademicYear()) : ""));
        response.setAcademicYear(material.getAcademicYear());
        response.setJoiningYear(material.getJoiningYear());
        
        response.setSemester(material.getSemester());
        response.setType(material.getType());
        response.setFileUrl(material.getFileUrl());
        response.setFileName(material.getFileName());
        response.setFileSize(material.getFileSize());
        response.setYouTubeUrl(material.getYouTubeUrl());
        response.setVideoTitle(material.getVideoTitle());
        
        response.setUploadedBy(material.getUploadedBy());
        response.setUploadedById(material.getUploadedBy());  // ✅ Set uploadedById from uploadedBy
        response.setUploadedByName(material.getUploadedByName());
        response.setUploadedByEmail(material.getUploadedByEmail());
        
        response.setStatus(material.getStatus());
        response.setAdminNotes(material.getAdminNotes());
        
        response.setCreatedAt(material.getCreatedAt());
        response.setUpdatedAt(material.getUpdatedAt());
        
        // New fields
        response.setDepartmentId(material.getDepartmentId());
        response.setDepartmentName(material.getDepartmentName());
        response.setRegulationId(material.getRegulationId());
        response.setRegulationName(material.getRegulationName());
        response.setCurriculumId(material.getCurriculumId());
        
        response.setHasSummary(false);
        
        return response;
    }
}