package com.studyhub.serviceImpl;

import com.studyhub.dto.request.TeacherAssignmentRequest;
import com.studyhub.entity.Department;
import com.studyhub.entity.TeacherAssignment;
import com.studyhub.entity.User;
import com.studyhub.exception.ResourceNotFoundException;
import com.studyhub.repository.DepartmentRepository;
import com.studyhub.repository.TeacherAssignmentRepository;
import com.studyhub.repository.UserRepository;
import com.studyhub.service.TeacherAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeacherAssignmentServiceImpl implements TeacherAssignmentService {

    @Autowired
    private TeacherAssignmentRepository teacherAssignmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Override
    public TeacherAssignment createOrUpdateAssignment(TeacherAssignmentRequest request) {
        if (request.getTeacherId() == null || request.getTeacherId().trim().isEmpty()) {
            throw new IllegalArgumentException("Teacher ID is required");
        }
        if (request.getDepartmentName() == null && request.getDepartmentId() == null) {
            throw new IllegalArgumentException("Department is required");
        }
        if (request.getSubjectName() == null && request.getSubjectId() == null) {
            throw new IllegalArgumentException("Subject is required");
        }

        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getTeacherId()));

        String deptId = request.getDepartmentId();
        String deptName = request.getDepartmentName();
        if (deptId != null && (deptName == null || deptName.isEmpty())) {
            Department d = departmentRepository.findById(deptId).orElse(null);
            if (d != null) deptName = d.getName();
        }

        // Check if an existing assignment matches teacher + department + subject + semester
        List<TeacherAssignment> existingList = teacherAssignmentRepository.findByTeacherId(teacher.getId());
        TeacherAssignment assignment = null;
        for (TeacherAssignment a : existingList) {
            boolean sameDept = (deptId != null && deptId.equalsIgnoreCase(a.getDepartmentId()))
                    || (deptName != null && deptName.equalsIgnoreCase(a.getDepartmentName()));
            boolean sameSubject = (request.getSubjectId() != null && request.getSubjectId().equalsIgnoreCase(a.getSubjectId()))
                    || (request.getSubjectName() != null && request.getSubjectName().equalsIgnoreCase(a.getSubjectName()));
            boolean sameSem = (request.getSemester() == null && a.getSemester() == null)
                    || (request.getSemester() != null && request.getSemester().equals(a.getSemester()));

            if (sameDept && sameSubject && sameSem) {
                assignment = a;
                break;
            }
        }

        if (assignment == null) {
            assignment = new TeacherAssignment();
            assignment.setCreatedAt(LocalDateTime.now());
        }

        assignment.setTeacherId(teacher.getId());
        assignment.setTeacherName(teacher.getFullName() != null && !teacher.getFullName().trim().isEmpty() 
                ? teacher.getFullName() 
                : teacher.getFirstName());
        assignment.setTeacherEmail(teacher.getEmail());
        assignment.setTeacherEmployeeId(teacher.getEmployeeId());

        assignment.setDepartmentId(deptId != null ? deptId : deptName);
        assignment.setDepartmentName(deptName != null ? deptName : deptId);

        assignment.setSubjectId(request.getSubjectId());
        assignment.setSubjectName(request.getSubjectName());

        assignment.setAcademicYear(request.getAcademicYear());
        assignment.setSemester(request.getSemester());
        assignment.setJoiningYear(request.getJoiningYear());
        assignment.setRegulationId(request.getRegulationId());
        assignment.setRegulationName(request.getRegulationName());
        assignment.setActive(true);
        assignment.setUpdatedAt(LocalDateTime.now());

        return teacherAssignmentRepository.save(assignment);
    }

    @Override
    public List<TeacherAssignment> getAllAssignments() {
        return teacherAssignmentRepository.findAll();
    }

    @Override
    public List<TeacherAssignment> getAssignmentsByTeacher(String teacherId) {
        if (teacherId == null || teacherId.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return teacherAssignmentRepository.findByTeacherIdAndActiveTrue(teacherId);
    }

    @Override
    public List<TeacherAssignment> getAssignmentsByDepartment(String departmentId) {
        if (departmentId == null || departmentId.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return teacherAssignmentRepository.findByDepartmentId(departmentId);
    }

    @Override
    public void deleteAssignment(String assignmentId) {
        teacherAssignmentRepository.deleteById(assignmentId);
    }

    @Override
    public TeacherAssignment findAssignedTeacherForCurriculum(String department, String departmentId,
                                                              String subject, String subjectId,
                                                              Integer academicYear, Integer semester,
                                                              String regulation) {
        List<TeacherAssignment> all = teacherAssignmentRepository.findAll();
        if (all.isEmpty()) return null;

        // Strategy 1: Exact match on Department + Subject + Academic Year + Semester + Regulation
        for (TeacherAssignment a : all) {
            if (!Boolean.TRUE.equals(a.getActive())) continue;
            boolean matchDept = matchDept(a, department, departmentId);
            boolean matchSub = matchSub(a, subject, subjectId);
            boolean matchYear = academicYear == null || a.getAcademicYear() == null || academicYear.equals(a.getAcademicYear());
            boolean matchSem = semester == null || a.getSemester() == null || semester.equals(a.getSemester());
            boolean matchReg = regulation == null || a.getRegulationName() == null || regulation.equalsIgnoreCase(a.getRegulationName()) || (a.getRegulationId() != null && regulation.equalsIgnoreCase(a.getRegulationId()));

            if (matchDept && matchSub && matchYear && matchSem && matchReg) {
                return a;
            }
        }

        // Strategy 2: Match Department + Subject + Semester
        for (TeacherAssignment a : all) {
            if (!Boolean.TRUE.equals(a.getActive())) continue;
            boolean matchDept = matchDept(a, department, departmentId);
            boolean matchSub = matchSub(a, subject, subjectId);
            boolean matchSem = semester == null || a.getSemester() == null || semester.equals(a.getSemester());

            if (matchDept && matchSub && matchSem) {
                return a;
            }
        }

        // Strategy 3: Match Department + Subject
        for (TeacherAssignment a : all) {
            if (!Boolean.TRUE.equals(a.getActive())) continue;
            boolean matchDept = matchDept(a, department, departmentId);
            boolean matchSub = matchSub(a, subject, subjectId);

            if (matchDept && matchSub) {
                return a;
            }
        }

        // Strategy 4: Match Subject only (e.g. specialized faculty across all departments)
        for (TeacherAssignment a : all) {
            if (!Boolean.TRUE.equals(a.getActive())) continue;
            if (matchSub(a, subject, subjectId)) {
                return a;
            }
        }

        return null;
    }

    @Override
    public List<Map<String, Object>> getTeachersForSubjectCurriculum(String department, String departmentId,
                                                                     String subject, String subjectId,
                                                                     Integer academicYear, Integer semester,
                                                                     String regulation) {
        List<Map<String, Object>> result = new ArrayList<>();
        Set<String> addedTeacherIds = new HashSet<>();

        // 1. First add specifically assigned teacher for this curriculum
        TeacherAssignment assigned = findAssignedTeacherForCurriculum(department, departmentId, subject, subjectId, academicYear, semester, regulation);
        if (assigned != null && assigned.getTeacherId() != null) {
            User teacherUser = userRepository.findById(assigned.getTeacherId()).orElse(null);
            if (teacherUser != null && isTeacherActive(teacherUser)) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", teacherUser.getId());
                map.put("name", teacherUser.getFullName());
                map.put("email", teacherUser.getEmail());
                map.put("employeeId", teacherUser.getEmployeeId());
                map.put("department", assigned.getDepartmentName() != null ? assigned.getDepartmentName() : teacherUser.getDepartment());
                map.put("isAssigned", true);
                map.put("subjectName", assigned.getSubjectName());
                result.add(map);
                addedTeacherIds.add(teacherUser.getId());
            }
        }

        // 2. Add all teachers assigned to this department or subject in TeacherAssignment
        List<TeacherAssignment> allAssignments = teacherAssignmentRepository.findAll();
        for (TeacherAssignment a : allAssignments) {
            if (!Boolean.TRUE.equals(a.getActive()) || a.getTeacherId() == null || addedTeacherIds.contains(a.getTeacherId())) {
                continue;
            }
            if (matchDept(a, department, departmentId) || matchSub(a, subject, subjectId)) {
                User teacherUser = userRepository.findById(a.getTeacherId()).orElse(null);
                if (teacherUser != null && isTeacherActive(teacherUser)) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", teacherUser.getId());
                    map.put("name", teacherUser.getFullName());
                    map.put("email", teacherUser.getEmail());
                    map.put("employeeId", teacherUser.getEmployeeId());
                    map.put("department", a.getDepartmentName() != null ? a.getDepartmentName() : teacherUser.getDepartment());
                    map.put("isAssigned", false);
                    map.put("subjectName", a.getSubjectName());
                    result.add(map);
                    addedTeacherIds.add(teacherUser.getId());
                }
            }
        }

        // 3. Add all teachers whose primary department matches
        List<User> deptTeachers = userRepository.findAll().stream()
                .filter(this::isTeacherActive)
                .filter(u -> (department != null && department.equalsIgnoreCase(u.getDepartment())) ||
                             (departmentId != null && departmentId.equalsIgnoreCase(u.getDepartmentId())))
                .collect(Collectors.toList());

        for (User t : deptTeachers) {
            if (!addedTeacherIds.contains(t.getId())) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", t.getId());
                map.put("name", t.getFullName());
                map.put("email", t.getEmail());
                map.put("employeeId", t.getEmployeeId());
                map.put("department", t.getDepartment());
                map.put("isAssigned", false);
                result.add(map);
                addedTeacherIds.add(t.getId());
            }
        }

        // 4. Fallback: all active teachers in the institute
        if (result.isEmpty()) {
            List<User> allTeachers = userRepository.findAll().stream()
                    .filter(this::isTeacherActive)
                    .collect(Collectors.toList());
            for (User t : allTeachers) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", t.getId());
                map.put("name", t.getFullName());
                map.put("email", t.getEmail());
                map.put("employeeId", t.getEmployeeId());
                map.put("department", t.getDepartment());
                map.put("isAssigned", false);
                result.add(map);
            }
        }

        return result;
    }

    @Override
    public List<Map<String, String>> getTeacherAssignedDepartments(String teacherId) {
        Set<String> deptNames = new LinkedHashSet<>();
        User teacher = userRepository.findById(teacherId).orElse(null);
        if (teacher != null && teacher.getDepartment() != null && !teacher.getDepartment().isEmpty()) {
            deptNames.add(teacher.getDepartment());
        }

        List<TeacherAssignment> assignments = teacherAssignmentRepository.findByTeacherIdAndActiveTrue(teacherId);
        for (TeacherAssignment a : assignments) {
            if (a.getDepartmentName() != null && !a.getDepartmentName().isEmpty()) {
                deptNames.add(a.getDepartmentName());
            } else if (a.getDepartmentId() != null && !a.getDepartmentId().isEmpty()) {
                deptNames.add(a.getDepartmentId());
            }
        }

        List<Department> allDepts = departmentRepository.findAll();
        List<Map<String, String>> list = new ArrayList<>();
        for (String name : deptNames) {
            Department found = allDepts.stream()
                    .filter(d -> (d.getName() != null && d.getName().equalsIgnoreCase(name)) ||
                                 (d.getCode() != null && d.getCode().equalsIgnoreCase(name)) ||
                                 (d.getId() != null && d.getId().equalsIgnoreCase(name)))
                    .findFirst().orElse(null);

            Map<String, String> m = new HashMap<>();
            m.put("id", found != null ? found.getId() : name);
            m.put("name", found != null ? found.getName() : name);
            m.put("code", found != null ? found.getCode() : name);
            list.add(m);
        }

        return list;
    }

    private boolean matchDept(TeacherAssignment a, String deptName, String deptId) {
        if (deptName == null && deptId == null) return true;
        if (a.getDepartmentName() != null) {
            if (deptName != null && a.getDepartmentName().equalsIgnoreCase(deptName)) return true;
            if (deptId != null && a.getDepartmentName().equalsIgnoreCase(deptId)) return true;
        }
        if (a.getDepartmentId() != null) {
            if (deptId != null && a.getDepartmentId().equalsIgnoreCase(deptId)) return true;
            if (deptName != null && a.getDepartmentId().equalsIgnoreCase(deptName)) return true;
        }
        return false;
    }

    private boolean matchSub(TeacherAssignment a, String subName, String subId) {
        if (subName == null && subId == null) return true;
        if (a.getSubjectName() != null) {
            if (subName != null && a.getSubjectName().equalsIgnoreCase(subName.trim())) return true;
            if (subId != null && a.getSubjectName().equalsIgnoreCase(subId.trim())) return true;
        }
        if (a.getSubjectId() != null) {
            if (subId != null && a.getSubjectId().equalsIgnoreCase(subId.trim())) return true;
            if (subName != null && a.getSubjectId().equalsIgnoreCase(subName.trim())) return true;
        }
        return false;
    }

    private boolean isTeacherActive(User user) {
        if (user == null) return false;
        String role = user.getRole();
        boolean isTeacherRole = "ROLE_TEACHER".equalsIgnoreCase(role) || "TEACHER".equalsIgnoreCase(role);
        boolean isActive = (user.getActive() == null || user.getActive()) && !"REJECTED".equalsIgnoreCase(user.getStatus());
        return isTeacherRole && isActive;
    }
}
