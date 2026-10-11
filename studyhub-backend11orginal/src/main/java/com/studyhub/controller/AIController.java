package com.studyhub.controller;

import com.studyhub.dto.request.AIChatRequest;
import com.studyhub.dto.response.ApiResponse;
import com.studyhub.dto.response.AISummaryResponse;
import com.studyhub.entity.ChatHistory;
import com.studyhub.security.JwtTokenProvider;
import com.studyhub.service.AIService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/api/ai")  // ✅ FIXED: Added /api prefix
@PreAuthorize("isAuthenticated()")
public class AIController {
    
    @Autowired
    private AIService aiService;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @PostMapping("/summarize/{materialId}")
    public ResponseEntity<ApiResponse> generateSummary(
            @PathVariable String materialId,
            @RequestHeader("Authorization") String token) {
        String userId = getUserIdFromToken(token);
        AISummaryResponse summary = aiService.generateSummary(materialId, userId);
        return ResponseEntity.ok(ApiResponse.success("Summary generated", summary, "/api/ai/summarize/" + materialId));
    }
    
    @GetMapping("/summary/{materialId}")
    public ResponseEntity<ApiResponse> getSummary(
            @PathVariable String materialId,
            @RequestHeader("Authorization") String token) {
        String userId = getUserIdFromToken(token);
        AISummaryResponse summary = aiService.getSummary(materialId, userId);
        return ResponseEntity.ok(ApiResponse.success("Summary retrieved", summary, "/api/ai/summary/" + materialId));
    }
    
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse> chat(
            @Valid @RequestBody AIChatRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            System.out.println("🤖 Chat request received");
            String userId = getUserIdFromToken(token);
            System.out.println("👤 User ID: " + userId);
            System.out.println("💬 Message: " + request.getMessage());
            if (request.getChatHistoryId() != null) {
                System.out.println("🗂️ Chat History ID: " + request.getChatHistoryId());
            }
            
            String response = aiService.chat(request.getMessage(), userId, request.getChatHistoryId());
            System.out.println("✅ Response: " + (response.length() > 50 ? response.substring(0, 50) + "..." : response));
            
            return ResponseEntity.ok(ApiResponse.success("AI response", response, "/api/ai/chat"));
        } catch (Exception e) {
            System.err.println("❌ Chat error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get AI response: " + e.getMessage(), "/api/ai/chat"));
        }
    }
    
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chatStream(
            @Valid @RequestBody AIChatRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            System.out.println("🤖 Streaming chat request received");
            String userId = getUserIdFromToken(token);
            String response = aiService.chat(request.getMessage(), userId);
            
            String[] words = response.split(" ");
            StringBuilder chunk = new StringBuilder();
            
            return Flux.create(sink -> {
                for (String word : words) {
                    chunk.append(word).append(" ");
                    if (chunk.length() > 20) {
                        sink.next("data: " + "{\"content\":\"" + chunk.toString() + "\"}\n\n");
                        chunk.setLength(0);
                    }
                }
                if (chunk.length() > 0) {
                    sink.next("data: " + "{\"content\":\"" + chunk.toString() + "\"}\n\n");
                }
                sink.next("data: [DONE]\n\n");
                sink.complete();
            });
            
        } catch (Exception e) {
            System.err.println("❌ Streaming chat error: " + e.getMessage());
            e.printStackTrace();
            return Flux.just("data: " + "{\"content\":\"Error: " + e.getMessage() + "\"}\n\n", "data: [DONE]\n\n");
        }
    }
    
    @GetMapping("/chat/histories")
    public ResponseEntity<ApiResponse> getChatHistories(@RequestHeader("Authorization") String token) {
        String userId = getUserIdFromToken(token);
        List<ChatHistory> histories = aiService.getChatHistories(userId);
        return ResponseEntity.ok(ApiResponse.success("Chat histories retrieved", histories, "/api/ai/chat/histories"));
    }
    
    @GetMapping("/chat/history/{chatId}")
    public ResponseEntity<ApiResponse> getChatHistory(
            @PathVariable String chatId,
            @RequestHeader("Authorization") String token) {
        String userId = getUserIdFromToken(token);
        ChatHistory history = aiService.getChatHistory(chatId, userId);
        return ResponseEntity.ok(ApiResponse.success("Chat history retrieved", history, "/api/ai/chat/history/" + chatId));
    }
    
    @DeleteMapping("/chat/history/{chatId}")
    public ResponseEntity<ApiResponse> deleteChatHistory(
            @PathVariable String chatId,
            @RequestHeader("Authorization") String token) {
        String userId = getUserIdFromToken(token);
        aiService.deleteChatHistory(chatId, userId);
        return ResponseEntity.ok(ApiResponse.success("Chat history deleted", null, "/api/ai/chat/history/" + chatId));
    }
    
    @DeleteMapping("/chat/history")
    public ResponseEntity<ApiResponse> clearAllChatHistory(@RequestHeader("Authorization") String token) {
        String userId = getUserIdFromToken(token);
        aiService.clearAllChatHistory(userId);
        return ResponseEntity.ok(ApiResponse.success("All chat history cleared", null, "/api/ai/chat/history"));
    }
    
    private String getUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        System.out.println("🔑 Extracted email from token: " + email);
        return email;
    }
}