package com.studyhub.repository;

import com.studyhub.entity.TeacherAssignment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherAssignmentRepository extends MongoRepository<TeacherAssignment, String> {

    List<TeacherAssignment> findByTeacherId(String teacherId);

    List<TeacherAssignment> findByTeacherIdAndActiveTrue(String teacherId);

    List<TeacherAssignment> findByTeacherEmail(String teacherEmail);

    List<TeacherAssignment> findByDepartmentId(String departmentId);

    List<TeacherAssignment> findByDepartmentNameIgnoreCase(String departmentName);

    List<TeacherAssignment> findBySubjectId(String subjectId);

    List<TeacherAssignment> findBySubjectNameIgnoreCase(String subjectName);

    List<TeacherAssignment> findByDepartmentIdAndSubjectId(String departmentId, String subjectId);

    List<TeacherAssignment> findByDepartmentNameIgnoreCaseAndSubjectNameIgnoreCase(String departmentName, String subjectName);
}
