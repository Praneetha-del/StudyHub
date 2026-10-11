package com.studyhub.exception;

import com.studyhub.dto.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleResourceNotFound(ResourceNotFoundException ex, WebRequest request) {
        ApiResponse response = ApiResponse.error(
            ex.getMessage(),
            request.getDescription(false),
            HttpStatus.NOT_FOUND.value()
        );
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse> handleDuplicateResource(DuplicateResourceException ex, WebRequest request) {
        ApiResponse response = ApiResponse.error(
            ex.getMessage(),
            request.getDescription(false),
            HttpStatus.CONFLICT.value()
        );
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse> handleUnauthorized(UnauthorizedException ex, WebRequest request) {
        ApiResponse response = ApiResponse.error(
            ex.getMessage(),
            request.getDescription(false),
            HttpStatus.UNAUTHORIZED.value()
        );
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse> handleForbidden(ForbiddenException ex, WebRequest request) {
        ApiResponse response = ApiResponse.error(
            ex.getMessage(),
            request.getDescription(false),
            HttpStatus.FORBIDDEN.value()
        );
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse> handleBadCredentials(BadCredentialsException ex, WebRequest request) {
        ApiResponse response = ApiResponse.error(
            "Invalid username or password",
            request.getDescription(false),
            HttpStatus.UNAUTHORIZED.value()
        );
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse> handleAccessDenied(AccessDeniedException ex, WebRequest request) {
        ApiResponse response = ApiResponse.error(
            "Access denied: " + ex.getMessage(),
            request.getDescription(false),
            HttpStatus.FORBIDDEN.value()
        );
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGlobalException(Exception ex, WebRequest request) {
        ApiResponse response = ApiResponse.error(
            "An unexpected error occurred: " + ex.getMessage(),
            request.getDescription(false),
            HttpStatus.INTERNAL_SERVER_ERROR.value()
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}