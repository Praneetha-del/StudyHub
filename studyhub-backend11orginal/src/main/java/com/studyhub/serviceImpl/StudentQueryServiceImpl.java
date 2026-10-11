package com.studyhub.serviceImpl;

import com.studyhub.dto.request.CreateQueryRequest;
import com.studyhub.dto.request.ReplyQueryRequest;
import com.studyhub.entity.Material;
import com.studyhub.entity.StudentQuery;
import com.studyhub.entity.TeacherAssignment;
import com.studyhub.entity.User;
import com.studyhub.exception.ResourceNotFoundException;
import com.studyhub.repository.MaterialRepository;
import com.studyhub.repository.StudentQueryRepository;
import com.studyhub.repository.TeacherAssignmentRepository;
import com.studyhub.repository.UserRepository;
import com.studyhub.service.StudentQueryService;
import com.studyhub.service.TeacherAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentQueryServiceImpl implements StudentQueryService {

    @Autowired
    private StudentQueryRepository studentQueryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private TeacherAssignmentRepository teacherAssignmentRepository;

    @Autowired
    private TeacherAssignmentService teacherAssignmentService;

    @Override
    public StudentQuery createQuery(User student, CreateQueryRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Query title is required");
        }
        if (request.getQueryText() == null || request.getQueryText().trim().isEmpty()) {
            throw new IllegalArgumentException("Query description is required");
        }
        if (request.getSubject() == null || request.getSubject().trim().isEmpty()) {
            throw new IllegalArgumentException("Subject is required");
        }

        StudentQuery query = new StudentQuery();
        query.setStudentId(student.getId());
        query.setStudentName(student.getFullName() != null && !student.getFullName().trim().isEmpty() 
                ? student.getFullName() 
                : student.getFirstName());
        query.setStudentEmail(student.getEmail());
        query.setStudentRollNumber(student.getRollNumber());

        String department = request.getDepartment() != null ? request.getDepartment() : student.getDepartment();
        String departmentId = request.getDepartmentId() != null ? request.getDepartmentId() : student.getDepartmentId();
        query.setDepartment(department);
        query.setDepartmentId(departmentId);
        query.setAcademicYear(request.getAcademicYear() != null ? request.getAcademicYear() : (student.getYear() != null ? String.valueOf(student.getYear()) : null));
        query.setSemester(request.getSemester() != null ? request.getSemester() : student.getSemester());
        query.setRegulation(request.getRegulation());
        query.setRegulationId(request.getRegulationId());

        query.setSubject(request.getSubject().trim());
        query.setSubjectId(request.getSubjectId());
        query.setTitle(request.getTitle().trim());
        query.setQueryText(request.getQueryText().trim());
        query.setStatus("PENDING");
        query.setCreatedAt(LocalDateTime.now());
        query.setUpdatedAt(LocalDateTime.now());

        // Identify Teacher
        String teacherId = request.getTeacherId();
        User teacher = null;

        if (teacherId != null && !teacherId.trim().isEmpty()) {
            teacher = userRepository.findById(teacherId).orElse(null);
        }

        // Identify using combination of: Student Department + Subject + Academic Year/Semester + Regulation
        if (teacher == null) {
            Integer acadYear = null;
            if (query.getAcademicYear() != null) {
                try {
                    acadYear = Integer.parseInt(query.getAcademicYear().replaceAll("\\D+", ""));
                } catch (Exception ignored) {}
            }

            TeacherAssignment assigned = teacherAssignmentService.findAssignedTeacherForCurriculum(
                    department, departmentId,
                    query.getSubject(), query.getSubjectId(),
                    acadYear, query.getSemester(),
                    query.getRegulation()
            );

            if (assigned != null && assigned.getTeacherId() != null) {
                teacher = userRepository.findById(assigned.getTeacherId()).orElse(null);
            }
        }

        // Fallback: check materials or department
        if (teacher == null) {
            teacher = findTeacherForSubject(request.getSubject(), request.getSubjectId(), department, departmentId);
        }

        if (teacher != null) {
            query.setTeacherId(teacher.getId());
            query.setTeacherName(teacher.getFullName() != null && !teacher.getFullName().trim().isEmpty()
                    ? teacher.getFullName()
                    : teacher.getFirstName());
            query.setTeacherEmail(teacher.getEmail());
        } else {
            // Fallback default teacher name if no specific teacher registered yet
            query.setTeacherName(department != null ? department + " Faculty" : "Subject Faculty");
        }

        return studentQueryRepository.save(query);
    }

    @Override
    public List<StudentQuery> getStudentQueries(User student) {
        if (student == null) return Collections.emptyList();
        List<StudentQuery> list = studentQueryRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());
        if (list.isEmpty() && student.getEmail() != null) {
            list = studentQueryRepository.findByStudentEmailOrderByCreatedAtDesc(student.getEmail());
        }
        return list;
    }

    @Override
    public List<StudentQuery> getTeacherQueries(User teacher, String status) {
        if (teacher == null) return Collections.emptyList();
        
        Set<String> queryIds = new HashSet<>();
        List<StudentQuery> combinedList = new ArrayList<>();

        // 1. Queries directly addressed to this teacher
        List<StudentQuery> directList;
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            directList = studentQueryRepository.findByTeacherIdAndStatusOrderByCreatedAtDesc(teacher.getId(), status.toUpperCase());
            if (directList.isEmpty() && teacher.getEmail() != null) {
                directList = studentQueryRepository.findByTeacherEmailAndStatusOrderByCreatedAtDesc(teacher.getEmail(), status.toUpperCase());
            }
        } else {
            directList = studentQueryRepository.findByTeacherIdOrderByCreatedAtDesc(teacher.getId());
            if (directList.isEmpty() && teacher.getEmail() != null) {
                directList = studentQueryRepository.findByTeacherEmailOrderByCreatedAtDesc(teacher.getEmail());
            }
        }

        for (StudentQuery q : directList) {
            if (queryIds.add(q.getId())) {
                combinedList.add(q);
            }
        }

        // 2. Include queries matching subjects & departments assigned to this teacher in TeacherAssignment
        List<TeacherAssignment> myAssignments = teacherAssignmentRepository.findByTeacherIdAndActiveTrue(teacher.getId());
        if (!myAssignments.isEmpty()) {
            List<StudentQuery> allPendingOrStatusQueries;
            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                allPendingOrStatusQueries = studentQueryRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
            } else {
                allPendingOrStatusQueries = studentQueryRepository.findAll();
            }

            for (StudentQuery q : allPendingOrStatusQueries) {
                if (queryIds.contains(q.getId())) continue;

                boolean matchesAssignment = myAssignments.stream().anyMatch(a -> {
                    boolean matchDept = (q.getDepartment() != null && q.getDepartment().equalsIgnoreCase(a.getDepartmentName()))
                            || (q.getDepartmentId() != null && q.getDepartmentId().equalsIgnoreCase(a.getDepartmentId()))
                            || (q.getDepartment() != null && q.getDepartment().equalsIgnoreCase(a.getDepartmentId()));

                    boolean matchSub = (q.getSubject() != null && q.getSubject().equalsIgnoreCase(a.getSubjectName()))
                            || (q.getSubjectId() != null && q.getSubjectId().equalsIgnoreCase(a.getSubjectId()))
                            || (q.getSubject() != null && q.getSubject().equalsIgnoreCase(a.getSubjectId()));

                    return matchDept && matchSub;
                });

                if (matchesAssignment) {
                    queryIds.add(q.getId());
                    combinedList.add(q);
                }
            }
        }

        // 3. If still empty, check teacher's primary department queries
        if (combinedList.isEmpty() && teacher.getDepartment() != null) {
            List<StudentQuery> deptQueries = studentQueryRepository.findByDepartmentOrderByCreatedAtDesc(teacher.getDepartment());
            if (deptQueries != null && !deptQueries.isEmpty()) {
                if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                    return deptQueries.stream()
                            .filter(q -> status.equalsIgnoreCase(q.getStatus()))
                            .collect(Collectors.toList());
                }
                return deptQueries;
            }
        }

        // Sort by createdAt descending
        combinedList.sort((a, b) -> {
            if (b.getCreatedAt() == null) return -1;
            if (a.getCreatedAt() == null) return 1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        return combinedList;
    }

    @Override
    public StudentQuery getQueryById(String id, User currentUser) {
        return studentQueryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Query", "id", id));
    }

    @Override
    public StudentQuery replyToQuery(String queryId, User teacher, ReplyQueryRequest request) {
        StudentQuery query = studentQueryRepository.findById(queryId)
                .orElseThrow(() -> new ResourceNotFoundException("Query", "id", queryId));

        if (request.getReplyText() == null || request.getReplyText().trim().isEmpty()) {
            throw new IllegalArgumentException("Reply text is required");
        }

        query.setReplyText(request.getReplyText().trim());
        query.setRepliedBy(teacher.getId());
        query.setRepliedByName(teacher.getFullName() != null && !teacher.getFullName().trim().isEmpty() 
                ? teacher.getFullName() 
                : teacher.getFirstName());
        query.setRepliedAt(LocalDateTime.now());
        query.setUpdatedAt(LocalDateTime.now());

        if (Boolean.TRUE.equals(request.getResolve()) || "RESOLVED".equalsIgnoreCase(request.getStatus())) {
            query.setStatus("RESOLVED");
        } else {
            query.setStatus("REPLIED");
        }

        return studentQueryRepository.save(query);
    }

    @Override
    public StudentQuery resolveQuery(String queryId, User currentUser) {
        StudentQuery query = studentQueryRepository.findById(queryId)
                .orElseThrow(() -> new ResourceNotFoundException("Query", "id", queryId));

        query.setStatus("RESOLVED");
        query.setUpdatedAt(LocalDateTime.now());
        return studentQueryRepository.save(query);
    }

    @Override
    public Map<String, Object> getTeachersForSubject(String subjectName, String subjectId, String department, String departmentId) {
        Map<String, Object> result = new HashMap<>();

        // 1. Identify primary teacher using TeacherAssignment first
        TeacherAssignment assigned = teacherAssignmentService.findAssignedTeacherForCurriculum(
                department, departmentId, subjectName, subjectId, null, null, null
        );

        User primaryTeacher = null;
        if (assigned != null && assigned.getTeacherId() != null) {
            primaryTeacher = userRepository.findById(assigned.getTeacherId()).orElse(null);
        }

        if (primaryTeacher == null) {
            primaryTeacher = findTeacherForSubject(subjectName, subjectId, department, departmentId);
        }

        if (primaryTeacher != null) {
            Map<String, Object> teacherMap = new HashMap<>();
            teacherMap.put("id", primaryTeacher.getId());
            teacherMap.put("name", primaryTeacher.getFullName());
            teacherMap.put("email", primaryTeacher.getEmail());
            teacherMap.put("department", assigned != null && assigned.getDepartmentName() != null ? assigned.getDepartmentName() : primaryTeacher.getDepartment());
            teacherMap.put("employeeId", primaryTeacher.getEmployeeId());
            result.put("identifiedTeacher", teacherMap);
        } else {
            result.put("identifiedTeacher", null);
        }

        // 2. Fetch all matching available teachers
        List<Map<String, Object>> teachersList = teacherAssignmentService.getTeachersForSubjectCurriculum(
                department, departmentId, subjectName, subjectId, null, null, null
        );

        result.put("availableTeachers", teachersList);
        return result;
    }

    @Override
    public Map<String, Object> getQueryStats(User currentUser) {
        Map<String, Object> stats = new HashMap<>();
        if (currentUser == null) return stats;

        boolean isTeacher = "ROLE_TEACHER".equalsIgnoreCase(currentUser.getRole()) || "TEACHER".equalsIgnoreCase(currentUser.getRole());
        boolean isStudent = "ROLE_STUDENT".equalsIgnoreCase(currentUser.getRole()) || "STUDENT".equalsIgnoreCase(currentUser.getRole());

        if (isTeacher) {
            List<StudentQuery> myQueries = getTeacherQueries(currentUser, "ALL");
            long pending = myQueries.stream().filter(q -> "PENDING".equalsIgnoreCase(q.getStatus())).count();
            long replied = myQueries.stream().filter(q -> "REPLIED".equalsIgnoreCase(q.getStatus())).count();
            long resolved = myQueries.stream().filter(q -> "RESOLVED".equalsIgnoreCase(q.getStatus())).count();
            stats.put("pending", pending);
            stats.put("replied", replied);
            stats.put("resolved", resolved);
            stats.put("total", myQueries.size());
        } else if (isStudent) {
            long pending = studentQueryRepository.countByStudentIdAndStatus(currentUser.getId(), "PENDING");
            long replied = studentQueryRepository.countByStudentIdAndStatus(currentUser.getId(), "REPLIED");
            long resolved = studentQueryRepository.countByStudentIdAndStatus(currentUser.getId(), "RESOLVED");
            stats.put("pending", pending);
            stats.put("replied", replied);
            stats.put("resolved", resolved);
            stats.put("total", pending + replied + resolved);
        }

        return stats;
    }

    private User findTeacherForSubject(String subjectName, String subjectId, String department, String departmentId) {
        // Step 1: Check teacher assignments
        TeacherAssignment assigned = teacherAssignmentService.findAssignedTeacherForCurriculum(department, departmentId, subjectName, subjectId, null, null, null);
        if (assigned != null && assigned.getTeacherId() != null) {
            Optional<User> u = userRepository.findById(assigned.getTeacherId());
            if (u.isPresent()) return u.get();
        }

        // Step 2: Check materials for this subject to find the teacher who uploaded them
        if (subjectId != null && !subjectId.isEmpty()) {
            List<Material> materials = materialRepository.findBySubjectId(subjectId);
            if (!materials.isEmpty()) {
                for (Material m : materials) {
                    if (m.getUploadedBy() != null) {
                        Optional<User> u = userRepository.findById(m.getUploadedBy());
                        if (u.isPresent() && ("ROLE_TEACHER".equalsIgnoreCase(u.get().getRole()) || "TEACHER".equalsIgnoreCase(u.get().getRole()))) {
                            return u.get();
                        }
                    }
                    if (m.getUploadedByEmail() != null) {
                        Optional<User> u = userRepository.findByEmail(m.getUploadedByEmail());
                        if (u.isPresent()) return u.get();
                    }
                }
            }
        }

        // Step 3: Search materials by subject title
        if (subjectName != null && !subjectName.isEmpty()) {
            List<Material> materials = materialRepository.findAll().stream()
                    .filter(m -> (m.getSubjectName() != null && m.getSubjectName().equalsIgnoreCase(subjectName)) ||
                                 (m.getSubject() != null && m.getSubject().equalsIgnoreCase(subjectName)))
                    .collect(Collectors.toList());
            if (!materials.isEmpty()) {
                for (Material m : materials) {
                    if (m.getUploadedBy() != null) {
                        Optional<User> u = userRepository.findById(m.getUploadedBy());
                        if (u.isPresent() && ("ROLE_TEACHER".equalsIgnoreCase(u.get().getRole()) || "TEACHER".equalsIgnoreCase(u.get().getRole()))) {
                            return u.get();
                        }
                    }
                }
            }
        }

        // Step 4: Find any active teacher in that department
        List<User> deptTeachers = userRepository.findAll().stream()
                .filter(u -> ("ROLE_TEACHER".equalsIgnoreCase(u.getRole()) || "TEACHER".equalsIgnoreCase(u.getRole())))
                .filter(u -> (department != null && department.equalsIgnoreCase(u.getDepartment())) ||
                             (departmentId != null && departmentId.equalsIgnoreCase(u.getDepartmentId())))
                .collect(Collectors.toList());

        if (!deptTeachers.isEmpty()) {
            return deptTeachers.get(0);
        }

        // Step 5: Fallback to any active teacher in the system
        return userRepository.findAll().stream()
                .filter(u -> ("ROLE_TEACHER".equalsIgnoreCase(u.getRole()) || "TEACHER".equalsIgnoreCase(u.getRole())))
                .findFirst()
                .orElse(null);
    }
}
