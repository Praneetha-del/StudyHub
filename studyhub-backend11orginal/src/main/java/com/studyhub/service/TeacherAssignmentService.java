package com.studyhub.service;

import com.studyhub.dto.request.TeacherAssignmentRequest;
import com.studyhub.entity.TeacherAssignment;
import com.studyhub.entity.User;

import java.util.List;
import java.util.Map;

public interface TeacherAssignmentService {

    TeacherAssignment createOrUpdateAssignment(TeacherAssignmentRequest request);

    List<TeacherAssignment> getAllAssignments();

    List<TeacherAssignment> getAssignmentsByTeacher(String teacherId);

    List<TeacherAssignment> getAssignmentsByDepartment(String departmentId);

    void deleteAssignment(String assignmentId);

    TeacherAssignment findAssignedTeacherForCurriculum(String department, String departmentId,
                                                      String subject, String subjectId,
                                                      Integer academicYear, Integer semester,
                                                      String regulation);

    List<Map<String, Object>> getTeachersForSubjectCurriculum(String department, String departmentId,
                                                             String subject, String subjectId,
                                                             Integer academicYear, Integer semester,
                                                             String regulation);

    List<Map<String, String>> getTeacherAssignedDepartments(String teacherId);
}
