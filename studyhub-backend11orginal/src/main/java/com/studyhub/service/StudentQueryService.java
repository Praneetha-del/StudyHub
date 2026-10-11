package com.studyhub.service;

import com.studyhub.dto.request.CreateQueryRequest;
import com.studyhub.dto.request.ReplyQueryRequest;
import com.studyhub.entity.StudentQuery;
import com.studyhub.entity.User;

import java.util.List;
import java.util.Map;

public interface StudentQueryService {

    StudentQuery createQuery(User student, CreateQueryRequest request);

    List<StudentQuery> getStudentQueries(User student);

    List<StudentQuery> getTeacherQueries(User teacher, String status);

    StudentQuery getQueryById(String id, User currentUser);

    StudentQuery replyToQuery(String queryId, User teacher, ReplyQueryRequest request);

    StudentQuery resolveQuery(String queryId, User currentUser);

    Map<String, Object> getTeachersForSubject(String subjectName, String subjectId, String department, String departmentId);

    Map<String, Object> getQueryStats(User currentUser);
}
