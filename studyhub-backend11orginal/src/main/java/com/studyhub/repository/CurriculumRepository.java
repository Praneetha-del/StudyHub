package com.studyhub.repository;

import com.studyhub.entity.Curriculum;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CurriculumRepository extends MongoRepository<Curriculum, String> {

    // ===== EXISTING METHODS =====
    
    Optional<Curriculum> findByDepartmentIdAndRegulationIdAndJoiningYearAndAcademicYearAndSemester(
        String departmentId, String regulationId, Integer joiningYear, Integer academicYear, Integer semester
    );

    List<Curriculum> findByDepartmentId(String departmentId);

    List<Curriculum> findByDepartmentIdAndActiveTrue(String departmentId);

    List<Curriculum> findByRegulationId(String regulationId);

    @Query("{ 'departmentId': ?0, 'regulationId': ?1, 'joiningYear': ?2, 'active': true }")
    List<Curriculum> findByDepartmentIdAndRegulationIdAndJoiningYear(
        String departmentId, String regulationId, Integer joiningYear
    );

    @Query("{ 'departmentId': ?0, 'joiningYear': ?1, 'semester': ?2, 'active': true }")
    List<Curriculum> findByDepartmentIdAndJoiningYearAndSemester(
        String departmentId, Integer joiningYear, Integer semester
    );

    @Query(value = "{ 'departmentId': ?0, 'regulationId': ?1, 'joiningYear': ?2, 'academicYear': ?3, 'semester': ?4 }", 
           fields = "{ 'subjectIds': 1, 'subjectNames': 1 }")
    Optional<Curriculum> findSubjectsByCurriculum(
        String departmentId, String regulationId, Integer joiningYear, Integer academicYear, Integer semester
    );

    boolean existsByDepartmentIdAndRegulationIdAndJoiningYearAndAcademicYearAndSemester(
        String departmentId, String regulationId, Integer joiningYear, Integer academicYear, Integer semester
    );

    boolean existsByJoiningYearAndDepartmentIdAndSemester(
        Integer joiningYear, String departmentId, Integer semester
    );

    @Query(value = "{ 'departmentId': ?0, 'active': true }", sort = "{ 'joiningYear': -1, 'semester': 1 }")
    List<Curriculum> findByDepartmentIdOrderByJoiningYearDescSemesterAsc(String departmentId);

    // ===== ✅ NEW METHODS =====
    
    @Query("{ 'departmentId': ?0, 'joiningYear': ?1, 'academicYear': ?2, 'semester': ?3 }")
    Optional<Curriculum> findByDepartmentIdAndJoiningYearAndAcademicYearAndSemester(
        String departmentId, Integer joiningYear, Integer academicYear, Integer semester
    );

    @Query("{ 'departmentId': ?0, 'semester': ?1 }")
    List<Curriculum> findByDepartmentIdAndSemester(
        String departmentId, Integer semester
    );

    @Query("{ 'departmentId': ?0, 'joiningYear': ?1, 'semester': ?2 }")
    List<Curriculum> findByDepartmentIdAndJoiningYearAndSemesterList(
        String departmentId, Integer joiningYear, Integer semester
    );
}