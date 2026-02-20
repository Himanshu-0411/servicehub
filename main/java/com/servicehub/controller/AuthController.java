package com.servicehub.controller;

import com.servicehub.dto.AuthDTOs;
import com.servicehub.dto.ServiceHubDTOs.ApiResponse;
import com.servicehub.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthDTOs.AuthResponse> login(@Valid @RequestBody AuthDTOs.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register/user")
    public ResponseEntity<AuthDTOs.AuthResponse> registerUser(@Valid @RequestBody AuthDTOs.RegisterRequest request) {
        return ResponseEntity.status(201).body(authService.registerUser(request));
    }

    @PostMapping("/register/provider")
    public ResponseEntity<AuthDTOs.AuthResponse> registerProvider(
            @Valid @RequestBody AuthDTOs.RegisterProviderRequest request) {
        return ResponseEntity.status(201).body(authService.registerProvider(request));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse> health() {
        return ResponseEntity.ok(ApiResponse.ok("ServiceHub API is running!"));
    }
}
