package com.studyhub.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Autowired(required = false)
    private MongoTemplate mongoTemplate;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("timestamp", Instant.now().toString());
        status.put("service", "StudyHub Monolithic Backend");

        try {
            if (mongoTemplate != null) {
                mongoTemplate.executeCommand("{ ping: 1 }");
                status.put("database", "CONNECTED");
            } else {
                status.put("database", "NOT_CONFIGURED");
            }
        } catch (Exception e) {
            status.put("database", "DISCONNECTED: " + e.getMessage());
        }

        return ResponseEntity.ok(status);
    }
}
