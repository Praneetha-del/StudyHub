package com.studyhub.repository;

import com.studyhub.entity.VerificationCode;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationCodeRepository extends MongoRepository<VerificationCode, String> {

    void deleteByEmail(String email);

    Optional<VerificationCode> findFirstByEmail(String email);

    Optional<VerificationCode> findByEmailAndCode(String email, String code);

    Optional<VerificationCode> findByEmailAndCodeAndVerifiedFalse(String email, String code);

    Optional<VerificationCode> findByCode(String code);

    List<VerificationCode> findByEmail(String email);

    // Query method for valid code
    @Query("{ 'email': ?0, 'code': ?1, 'verified': false, 'expiryDate': { $gt: ?2 } }")
    Optional<VerificationCode> findValidCode(String email, String code, LocalDateTime expiryDate);

    // Get all unverified codes for a user (returns List)
    List<VerificationCode> findAllByEmailAndVerifiedFalse(String email);

    // Get all unverified codes ordered by createdAt descending (returns List)
    List<VerificationCode> findAllByEmailAndVerifiedFalseOrderByCreatedAtDesc(String email);

    // Get the latest unverified code for a user (returns Optional)
    Optional<VerificationCode> findFirstByEmailAndVerifiedFalseOrderByCreatedAtDesc(String email);

    void deleteByExpiryDateBefore(LocalDateTime date);
}