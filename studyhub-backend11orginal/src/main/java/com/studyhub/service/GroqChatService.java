package com.studyhub.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GroqChatService {

    @Value("${groq.api.key:${spring.ai.openai.api-key:${GROQ_API_KEY:}}}")
    private String apiKey;

    @Value("${groq.model:${GROQ_MODEL:openai/gpt-oss-120b}}")
    private String configuredModel;

    @Value("${groq.api.url:${GROQ_API_URL:https://api.groq.com/openai/v1/chat/completions}}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final List<String> FALLBACK_MODELS = List.of(
            "openai/gpt-oss-120b",
            "openai/gpt-oss-20b",
            "qwen/qwen3.8-27b",
            "allam-2-7b",
            "llama-3.3-70b-versatile"
    );

    public GroqChatService(
            @Value("${groq.api.key:${spring.ai.openai.api-key:${GROQ_API_KEY:}}}") String apiKey,
            @Value("${groq.model:${GROQ_MODEL:openai/gpt-oss-120b}}") String model,
            @Value("${groq.api.url:${GROQ_API_URL:https://api.groq.com/openai/v1/chat/completions}}") String apiUrl) {
        
        this.apiKey = apiKey;
        this.configuredModel = model;
        this.apiUrl = apiUrl;

        System.out.println("========================================");
        System.out.println("📦 Initializing Groq Chat Service");
        System.out.println("🔑 API Key: " + (apiKey != null && !apiKey.isEmpty() ? "✅ Set (" + apiKey.substring(0, Math.min(10, apiKey.length())) + "...)" : "❌ MISSING"));
        System.out.println("📦 Model: " + model);
        System.out.println("🌐 API URL: " + apiUrl);
        System.out.println("========================================");
    }

    public String chat(String message) {
        return chatWithSystemPrompt(
                "You are a helpful StudyHub AI academic assistant. Help students with their academic questions, study materials, formulas, algorithms, syllabus topics, and exam preparation. Provide clear, well-formatted, and educational responses using markdown.",
                message
        );
    }

    public String chatWithSystemPrompt(String systemPrompt, String userMessage) {
        List<Map<String, String>> messages = new ArrayList<>();
        if (systemPrompt != null && !systemPrompt.trim().isEmpty()) {
            Map<String, String> sysMsg = new HashMap<>();
            sysMsg.put("role", "system");
            sysMsg.put("content", systemPrompt);
            messages.add(sysMsg);
        }

        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        messages.add(userMsg);

        return executeChatCompletion(messages);
    }

    public String chatWithMessages(List<Map<String, String>> messages) {
        return executeChatCompletion(messages);
    }

    private String executeChatCompletion(List<Map<String, String>> messages) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            System.err.println("❌ Groq API key is missing");
            return "AI service is currently unavailable. Please configure the API key.";
        }

        List<String> modelsToTry = new ArrayList<>();
        if (configuredModel != null && !configuredModel.trim().isEmpty()) {
            modelsToTry.add(configuredModel.trim());
        }
        for (String m : FALLBACK_MODELS) {
            if (!modelsToTry.contains(m)) {
                modelsToTry.add(m);
            }
        }

        Exception lastException = null;

        for (String modelName : modelsToTry) {
            try {
                System.out.println("💬 Calling Groq API with model: " + modelName);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(apiKey.trim());

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", modelName);
                requestBody.put("messages", messages);
                requestBody.put("temperature", 0.7);
                requestBody.put("max_tokens", 2048);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

                ResponseEntity<String> response = restTemplate.exchange(
                        apiUrl != null && !apiUrl.trim().isEmpty() ? apiUrl.trim() : "https://api.groq.com/openai/v1/chat/completions",
                        HttpMethod.POST,
                        entity,
                        String.class
                );

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode choices = root.path("choices");
                    if (choices.isArray() && choices.size() > 0) {
                        JsonNode messageNode = choices.get(0).path("message");
                        String content = messageNode.path("content").asText(null);
                        
                        // Fallback to reasoning if content is empty
                        if (content == null || content.trim().isEmpty()) {
                            content = messageNode.path("reasoning").asText(null);
                        }

                        if (content != null && !content.trim().isEmpty()) {
                            System.out.println("✅ Groq response received successfully with model " + modelName);
                            return content.trim();
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("⚠️ Groq API attempt failed with model " + modelName + ": " + e.getMessage());
                lastException = e;
            }
        }

        if (lastException != null) {
            lastException.printStackTrace();
        }
        return "I'm having trouble connecting to the AI service right now. Please try again in a moment.";
    }
}