package com.studyhub.repository;

import com.studyhub.entity.StudentQuery;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentQueryRepository extends MongoRepository<StudentQuery, String> {

    List<StudentQuery> findByStudentIdOrderByCreatedAtDesc(String studentId);

    List<StudentQuery> findByStudentEmailOrderByCreatedAtDesc(String studentEmail);

    List<StudentQuery> findByTeacherIdOrderByCreatedAtDesc(String teacherId);

    List<StudentQuery> findByTeacherEmailOrderByCreatedAtDesc(String teacherEmail);

    List<StudentQuery> findByTeacherIdAndStatusOrderByCreatedAtDesc(String teacherId, String status);

    List<StudentQuery> findByTeacherEmailAndStatusOrderByCreatedAtDesc(String teacherEmail, String status);

    List<StudentQuery> findByDepartmentOrderByCreatedAtDesc(String department);

    List<StudentQuery> findByDepartmentIdOrderByCreatedAtDesc(String departmentId);

    List<StudentQuery> findBySubjectIgnoreCaseOrderByCreatedAtDesc(String subject);

    List<StudentQuery> findByStatusOrderByCreatedAtDesc(String status);

    long countByTeacherIdAndStatus(String teacherId, String status);

    long countByTeacherEmailAndStatus(String teacherEmail, String status);

    long countByStudentIdAndStatus(String studentId, String status);

    long countByStudentEmailAndStatus(String studentEmail, String status);
}
