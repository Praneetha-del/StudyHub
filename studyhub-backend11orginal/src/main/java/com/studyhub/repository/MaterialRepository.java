package com.studyhub.repository;

import com.studyhub.entity.Material;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaterialRepository extends MongoRepository<Material, String> {

    // ===== EXISTING METHODS =====
    List<Material> findByUploadedBy(String uploadedBy);
    
    Page<Material> findByStatus(String status, Pageable pageable);
    
    long countByStatus(String status);
    
    @Query("{ $or: [ { 'title': { $regex: ?0, $options: 'i' } }, { 'subject': { $regex: ?0, $options: 'i' } } ], 'status': ?1 }")
    Page<Material> searchByTitleOrSubjectAndStatus(String search, String status, Pageable pageable);

    // ===== NEW METHODS FOR CURRICULUM SUPPORT =====
    List<Material> findByDepartmentIdAndRegulationIdAndJoiningYearAndAcademicYearAndSemester(
        String departmentId, String regulationId, Integer joiningYear, Integer academicYear, Integer semester
    );
    
    List<Material> findByTitleContainingIgnoreCase(String title);
    Page<Material> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    
    List<Material> findByDepartmentId(String departmentId);
    
    List<Material> findByDepartmentIdAndSemester(String departmentId, Integer semester);
    
    List<Material> findBySubjectId(String subjectId);
    
    List<Material> findByCurriculumId(String curriculumId);
}