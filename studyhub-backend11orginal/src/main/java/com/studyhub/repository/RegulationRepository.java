// RegulationRepository.java
package com.studyhub.repository;

import com.studyhub.entity.Regulation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegulationRepository extends MongoRepository<Regulation, String> {
    Optional<Regulation> findByCode(String code);
    List<Regulation> findByActiveTrue();
    boolean existsByCode(String code);
}