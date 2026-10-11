package com.studyhub.dto.response;

import java.time.LocalDateTime;

public class ApiResponse {
    private boolean success;
    private String message;
    private Object data;
    private String path;
    private int status;
    private LocalDateTime timestamp;

    // ===== DEFAULT CONSTRUCTOR =====
    public ApiResponse() {
    }

    // ===== FULL CONSTRUCTOR =====
    public ApiResponse(boolean success, String message, Object data, String path, int status) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.path = path;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    // ===== STATIC FACTORY METHODS =====
    public static ApiResponse success(String message, Object data, String path) {
        return new ApiResponse(true, message, data, path, 200);
    }

    public static ApiResponse success(String message, String path) {
        return new ApiResponse(true, message, null, path, 200);
    }

    public static ApiResponse error(String message, String path) {
        return new ApiResponse(false, message, null, path, 400);
    }

    public static ApiResponse error(String message, String path, int status) {
        return new ApiResponse(false, message, null, path, status);
    }

    // ===== GETTERS AND SETTERS =====
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}