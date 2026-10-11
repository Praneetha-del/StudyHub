package com.studyhub.serviceImpl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyhub.dto.response.AISummaryResponse;
import com.studyhub.entity.AISummary;
import com.studyhub.entity.ChatHistory;
import com.studyhub.entity.Material;
import com.studyhub.exception.ResourceNotFoundException;
import com.studyhub.repository.AISummaryRepository;
import com.studyhub.repository.ChatHistoryRepository;
import com.studyhub.repository.MaterialRepository;
import com.studyhub.service.AIService;
import com.studyhub.service.GroqChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AIServiceImpl implements AIService {

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private AISummaryRepository summaryRepository;

    @Autowired
    private ChatHistoryRepository chatHistoryRepository;

    @Autowired
    private GroqChatService groqChatService;

    @Value("${GEMINI_API_KEY:}")
    private String geminiApiKey;

    @Value("${GEMINI_MODEL:gemini-2.5-flash}")
    private String geminiModel;

    @Value("${groq.use:${USE_GROQ:true}}")
    private boolean useGroq;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    @Override
    public AISummaryResponse generateSummary(String materialId, String userId) {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material", "id", materialId));

        Optional<AISummary> existingSummary = summaryRepository.findByMaterialIdAndUserId(materialId, userId);
        if (existingSummary.isPresent()) {
            return convertToResponse(existingSummary.get(), material);
        }

        // ✅ Get subject name from existing field (subject) or new field (subjectName)
        String subjectName = material.getSubject();
        if (subjectName == null || subjectName.isEmpty()) {
            subjectName = material.getSubjectName();
        }
        if (subjectName == null || subjectName.isEmpty()) {
            subjectName = "Unknown Subject";
        }

        String prompt = String.format(
            "Please provide a comprehensive summary of the following study material:\n\n" +
            "Title: %s\n" +
            "Subject: %s\n" +
            "Description: %s\n\n" +
            "Please provide summary, key points, and important concepts.",
            material.getTitle(),
            subjectName,
            material.getDescription() != null ? material.getDescription() : "No description available"
        );

        String responseText = chatInternal(prompt, userId);
        System.out.println("✅ AI response received");

        // ✅ Extract key points and concepts from the response (simple extraction)
        List<String> keyPoints = extractKeyPoints(responseText);
        List<String> concepts = extractConcepts(responseText);

        AISummary summary = new AISummary();
        summary.setMaterialId(materialId);
        summary.setUserId(userId);
        summary.setSummary(responseText);
        summary.setKeyPoints(keyPoints);
        summary.setImportantConcepts(concepts);
        summary.setCreatedAt(LocalDateTime.now());
        summary.setUpdatedAt(LocalDateTime.now());

        summaryRepository.save(summary);

        return convertToResponse(summary, material);
    }

    @Override
    public AISummaryResponse getSummary(String materialId, String userId) {
        AISummary summary = summaryRepository.findByMaterialIdAndUserId(materialId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Summary not found"));

        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material", "id", materialId));

        return convertToResponse(summary, material);
    }

    @Override
    public String chat(String message, String userId) {
        return chat(message, userId, null);
    }

    @Override
    public String chat(String message, String userId, String chatHistoryId) {
        ChatHistory chatHistory = null;
        
        if (chatHistoryId != null && !chatHistoryId.trim().isEmpty()) {
            chatHistory = chatHistoryRepository.findByIdAndUserId(chatHistoryId.trim(), userId).orElse(null);
        }

        if (chatHistory == null) {
            chatHistory = new ChatHistory(userId);
            System.out.println("🆕 Creating new conversation for user: " + userId);
        } else {
            System.out.println("📝 Continuing existing conversation (ID: " + chatHistory.getId() + ") for user: " + userId);
        }
        
        // Save user message
        ChatHistory.ChatMessage userMsg = new ChatHistory.ChatMessage(
            "USER", message, LocalDateTime.now()
        );
        chatHistory.getMessages().add(userMsg);
        
        // Get AI response with conversation context
        String response = chatInternalWithHistory(chatHistory.getMessages(), userId);
        
        // Save AI response
        ChatHistory.ChatMessage aiMsg = new ChatHistory.ChatMessage(
            "AI", response, LocalDateTime.now()
        );
        chatHistory.getMessages().add(aiMsg);
        
        // Generate title if first message
        if (chatHistory.getTitle() == null || chatHistory.getTitle().isEmpty()) {
            chatHistory.setTitle(chatHistory.generateTitle());
        }
        
        chatHistory.setUpdatedAt(LocalDateTime.now());
        chatHistoryRepository.save(chatHistory);
        
        return response;
    }

    @Override
    public String chatWithContext(String message, String userId, Map<String, Object> context) {
        return chat(message, userId);
    }

    // ✅ Get all chat histories for a user
    @Override
    public List<ChatHistory> getChatHistories(String userId) {
        return chatHistoryRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    // ✅ Get specific chat history
    @Override
    public ChatHistory getChatHistory(String chatId, String userId) {
        return chatHistoryRepository.findByIdAndUserId(chatId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat history not found"));
    }

    // ✅ Delete chat history
    @Override
    public void deleteChatHistory(String chatId, String userId) {
        chatHistoryRepository.deleteByIdAndUserId(chatId, userId);
    }

    // ✅ Clear all chat history for a user
    @Override
    public void clearAllChatHistory(String userId) {
        chatHistoryRepository.deleteByUserId(userId);
    }

    private String chatInternalWithHistory(List<ChatHistory.ChatMessage> messages, String userId) {
        System.out.println("🔍 Chat request received with " + messages.size() + " turn(s)");
        System.out.println("⚡ Using " + (useGroq ? "GROQ" : "GEMINI"));

        try {
            if (useGroq) {
                List<Map<String, String>> groqMessages = new ArrayList<>();
                Map<String, String> sysMsg = new HashMap<>();
                sysMsg.put("role", "system");
                sysMsg.put("content", "You are a helpful StudyHub AI academic assistant. Help students with their academic questions, study materials, formulas, algorithms, syllabus topics, and exam preparation. Provide clear, well-formatted, and educational responses using markdown.");
                groqMessages.add(sysMsg);

                // Take last 8 messages for context
                int start = Math.max(0, messages.size() - 8);
                for (int i = start; i < messages.size(); i++) {
                    ChatHistory.ChatMessage m = messages.get(i);
                    Map<String, String> msgMap = new HashMap<>();
                    msgMap.put("role", "USER".equalsIgnoreCase(m.getRole()) ? "user" : "assistant");
                    msgMap.put("content", m.getContent() != null ? m.getContent() : "");
                    groqMessages.add(msgMap);
                }

                String response = groqChatService.chatWithMessages(groqMessages);
                if (response == null || response.isEmpty()) {
                    return "I'm having trouble generating a response right now. Please try again.";
                }
                if (response.startsWith("⚠️") || response.startsWith("❌") || response.startsWith("Error")) {
                    System.err.println("⚠️ Groq returned error message: " + response);
                    return "I'm having trouble connecting to the AI service. Please try again later.";
                }
                System.out.println("✅ Groq response received");
                return response;
            } else {
                String lastUserMsg = messages.isEmpty() ? "" : messages.get(messages.size() - 1).getContent();
                return callGeminiApi(lastUserMsg);
            }
        } catch (Exception e) {
            System.err.println("❌ AI API error: " + e.getMessage());
            e.printStackTrace();
            return "⚠️ Error calling AI API: " + e.getMessage();
        }
    }

    private String chatInternal(String message, String userId) {
        System.out.println("🔍 Chat request received");
        System.out.println("⚡ Using " + (useGroq ? "GROQ" : "GEMINI"));

        try {
            if (useGroq) {
                String response = groqChatService.chat(message);
                if (response == null || response.isEmpty()) {
                    return "I'm having trouble generating a response right now. Please try again.";
                }
                if (response.startsWith("⚠️") || response.startsWith("❌") || response.startsWith("Error")) {
                    System.err.println("⚠️ Groq returned error message: " + response);
                    return "I'm having trouble connecting to the AI service. Please try again later.";
                }
                System.out.println("✅ Groq response received");
                return response;
            } else {
                return callGeminiApi(message);
            }
        } catch (Exception e) {
            System.err.println("❌ AI API error: " + e.getMessage());
            e.printStackTrace();
            return "⚠️ Error calling AI API: " + e.getMessage();
        }
    }

    private String callGeminiApi(String prompt) throws Exception {
        String url = String.format(GEMINI_API_URL, geminiModel, geminiApiKey);

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        Map<String, Object> parts = new HashMap<>();
        parts.put("text", prompt);
        content.put("parts", new Object[]{parts});
        requestBody.put("contents", new Object[]{content});

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                String.class
        );

        if (response.getStatusCode() == HttpStatus.OK) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode contentNode = candidates.get(0).path("content");
                JsonNode partsNode = contentNode.path("parts");
                if (partsNode.isArray() && partsNode.size() > 0) {
                    return partsNode.get(0).path("text").asText();
                }
            }
            return "No response from Gemini AI.";
        } else {
            throw new Exception("Gemini API error: " + response.getStatusCode());
        }
    }

    /**
     * ✅ Extract key points from AI response
     * Looks for bullet points, numbered lists, or "key point" markers
     */
    private List<String> extractKeyPoints(String response) {
        List<String> keyPoints = new ArrayList<>();
        
        if (response == null || response.isEmpty()) {
            keyPoints.add("No key points available");
            return keyPoints;
        }

        // Split by new lines
        String[] lines = response.split("\n");
        
        for (String line : lines) {
            String trimmed = line.trim();
            
            // Check for bullet points, numbered lists, or key point markers
            if (trimmed.matches("^[-•*]\\s+.+") || 
                trimmed.matches("^\\d+\\.\\s+.+") ||
                trimmed.toLowerCase().contains("key point") ||
                trimmed.toLowerCase().contains("important")) {
                
                // Clean up the line
                String cleaned = trimmed.replaceAll("^[-•*]\\s+", "")
                                       .replaceAll("^\\d+\\.\\s+", "");
                if (cleaned.length() > 10 && keyPoints.size() < 7) {
                    keyPoints.add(cleaned);
                }
            }
        }

        // If no key points found, try to extract sentences starting with keywords
        if (keyPoints.isEmpty()) {
            String[] sentences = response.split("[.!?]");
            for (String sentence : sentences) {
                String trimmed = sentence.trim();
                if (trimmed.toLowerCase().contains("key") || 
                    trimmed.toLowerCase().contains("important") ||
                    trimmed.toLowerCase().contains("main")) {
                    if (trimmed.length() > 15 && keyPoints.size() < 7) {
                        keyPoints.add(trimmed);
                    }
                }
            }
        }

        // If still empty, add a default
        if (keyPoints.isEmpty()) {
            keyPoints.add("Review the full summary for key points");
        }

        return keyPoints;
    }

    /**
     * ✅ Extract important concepts from AI response
     */
    private List<String> extractConcepts(String response) {
        List<String> concepts = new ArrayList<>();
        
        if (response == null || response.isEmpty()) {
            concepts.add("No concepts available");
            return concepts;
        }

        // Look for concept markers in the response
        String[] lines = response.split("\n");
        
        for (String line : lines) {
            String trimmed = line.trim();
            
            if (trimmed.toLowerCase().contains("concept") || 
                trimmed.toLowerCase().contains("definition") ||
                trimmed.toLowerCase().contains("term") ||
                trimmed.matches("^[-•*]\\s+.+") && trimmed.length() < 80) {
                
                String cleaned = trimmed.replaceAll("^[-•*]\\s+", "");
                if (cleaned.length() > 5 && concepts.size() < 7 && !concepts.contains(cleaned)) {
                    concepts.add(cleaned);
                }
            }
        }

        // If no concepts found, extract key terms (words that appear frequently)
        if (concepts.isEmpty()) {
            String[] words = response.split("[\\s,.;:!?()\"]+");
            Map<String, Integer> wordCount = new HashMap<>();
            
            for (String word : words) {
                if (word.length() > 4 && !word.matches(".*\\d.*")) {
                    String lower = word.toLowerCase();
                    wordCount.put(lower, wordCount.getOrDefault(lower, 0) + 1);
                }
            }
            
            // Get top 5 most frequent words
            wordCount.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .forEach(entry -> concepts.add(entry.getKey()));
        }

        // If still empty, add a default
        if (concepts.isEmpty()) {
            concepts.add("Review the full summary for important concepts");
        }

        return concepts;
    }

    private AISummaryResponse convertToResponse(AISummary summary, Material material) {
        AISummaryResponse response = new AISummaryResponse();
        response.setMaterialId(summary.getMaterialId());
        response.setMaterialTitle(material.getTitle());
        response.setSummary(summary.getSummary());
        response.setKeyPoints(summary.getKeyPoints());
        response.setImportantConcepts(summary.getImportantConcepts());
        response.setGeneratedAt(summary.getCreatedAt().toString());
        return response;
    }
}