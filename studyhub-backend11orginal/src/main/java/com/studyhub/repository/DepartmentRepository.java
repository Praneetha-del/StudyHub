package com.studyhub.repository;

import com.studyhub.entity.Department;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentRepository extends MongoRepository<Department, String> {
    
    Optional<Department> findByName(String name);
    
    Optional<Department> findByCode(String code);
    
    boolean existsByName(String name);
}