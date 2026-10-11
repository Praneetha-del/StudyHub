package com.studyhub.repository;

import com.studyhub.entity.ChatHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatHistoryRepository extends MongoRepository<ChatHistory, String> {
    
    // ✅ Find all chat histories for a user, sorted by updatedAt descending
    List<ChatHistory> findByUserIdOrderByUpdatedAtDesc(String userId);
    
    // ✅ Find with pagination
    Page<ChatHistory> findByUserId(String userId, Pageable pageable);
    
    // ✅ Find first by userId (for current conversation)
    Optional<ChatHistory> findFirstByUserIdOrderByUpdatedAtDesc(String userId);
    
    Optional<ChatHistory> findByIdAndUserId(String id, String userId);
    
    void deleteByIdAndUserId(String id, String userId);
    
    void deleteByUserId(String userId);
    
    // ✅ Count conversations for a user
    long countByUserId(String userId);
}