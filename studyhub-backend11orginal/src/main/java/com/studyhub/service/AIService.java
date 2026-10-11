package com.studyhub.service;

import com.studyhub.dto.response.AISummaryResponse;
import com.studyhub.entity.ChatHistory;

import java.util.List;
import java.util.Map;

public interface AIService {
    
    AISummaryResponse generateSummary(String materialId, String userId);
    AISummaryResponse getSummary(String materialId, String userId);
    String chat(String message, String userId);
    String chat(String message, String userId, String chatHistoryId);
    String chatWithContext(String message, String userId, Map<String, Object> context);
    
    // ✅ NEW: Chat History Methods
    List<ChatHistory> getChatHistories(String userId);
    ChatHistory getChatHistory(String chatId, String userId);
    void deleteChatHistory(String chatId, String userId);
    void clearAllChatHistory(String userId);
}