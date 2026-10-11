package com.studyhub.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyhub.dto.response.ApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        // Set response status
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");

        // Use static factory method
        ApiResponse errorResponse = ApiResponse.error(
            "Authentication failed: " + authException.getMessage(),
            request.getRequestURI(),
            HttpStatus.UNAUTHORIZED.value()
        );

        // Write response
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}