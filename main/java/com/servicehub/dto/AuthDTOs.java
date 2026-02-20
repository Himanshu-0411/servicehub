package com.servicehub.dto;

import com.servicehub.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDTOs {

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6)
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank
        private String fullName;
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6)
        private String password;
        @NotBlank
        private String phone;
        private User.Role role = User.Role.USER;
    }

    @Data
    public static class RegisterProviderRequest {
        @NotBlank
        private String fullName;
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6)
        private String password;
        @NotBlank
        private String phone;
        @NotBlank
        private String city;
        @NotBlank
        private String description;
        private Integer experienceYears;
        private Double hourlyRate;
        private java.util.List<Long> serviceCategoryIds;
        private String credentialInfo;
    }

    @Data
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private Long userId;
        private String email;
        private String fullName;
        private String role;

        public AuthResponse(String accessToken, String refreshToken, Long userId,
                            String email, String fullName, String role) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.userId = userId;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
        }
    }

    @Data
    public static class RefreshTokenRequest {
        @NotBlank
        private String refreshToken;
    }
}
