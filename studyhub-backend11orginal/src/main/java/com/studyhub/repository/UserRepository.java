package com.studyhub.repository;

import com.studyhub.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    // ========== FIND BY EMAIL ==========
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // ========== FIND BY ROLL NUMBER ==========
    Optional<User> findByRollNumber(String rollNumber);
    boolean existsByRollNumber(String rollNumber);

    // ========== FIND BY EMPLOYEE ID ==========
    Optional<User> findByEmployeeId(String employeeId);
    boolean existsByEmployeeId(String employeeId);

    // ========== COUNT METHODS ==========
    long countByRole(String role);
    long countByRoleAndStatus(String role, String status);
    long countByStatus(String status);

    // ========== PAGEABLE FIND METHODS ==========
    Page<User> findByRole(String role, Pageable pageable);
    Page<User> findByRoleAndStatus(String role, String status, Pageable pageable);
    Page<User> findByEmailContainingIgnoreCase(String email, Pageable pageable);
    Page<User> findByRoleAndEmailContainingIgnoreCase(String role, String email, Pageable pageable);

    // ========== FIND BY STATUS ==========
    @Query("{ 'status': ?0 }")
    Page<User> findByStatus(String status, Pageable pageable);

    // ========== FIND BY DEPARTMENT ==========
    Page<User> findByDepartment(String department, Pageable pageable);
    Page<User> findByDepartmentAndRole(String department, String role, Pageable pageable);

    // ========== SEARCH ==========
    @Query("{ $or: [ " +
            "{ 'firstName': { $regex: ?0, $options: 'i' } }, " +
            "{ 'lastName': { $regex: ?0, $options: 'i' } }, " +
            "{ 'email': { $regex: ?0, $options: 'i' } }, " +
            "{ 'rollNumber': { $regex: ?0, $options: 'i' } }, " +
            "{ 'employeeId': { $regex: ?0, $options: 'i' } } ] }")
    Page<User> searchUsers(String searchTerm, Pageable pageable);
}