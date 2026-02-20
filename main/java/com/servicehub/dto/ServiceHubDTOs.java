package com.servicehub.dto;

import com.servicehub.entity.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class ServiceHubDTOs {


    @Data @AllArgsConstructor
    public static class ApiResponse {
        private boolean success;
        private String message;
        private Object data;

        public static ApiResponse ok(String message, Object data) {
            return new ApiResponse(true, message, data);
        }

        public static ApiResponse ok(String message) {
            return new ApiResponse(true, message, null);
        }

        public static ApiResponse error(String message) {
            return new ApiResponse(false, message, null);
        }
    }


    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AddressRequest {
        @NotBlank private String label;
        @NotBlank private String street;
        @NotBlank private String city;
        @NotBlank private String state;
        @NotBlank private String pincode;
        @NotBlank private String country;
        private Double latitude;
        private Double longitude;
        private Boolean isDefault = false;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AddressResponse {
        private Long id;
        private String label;
        private String street;
        private String city;
        private String state;
        private String pincode;
        private String country;
        private Boolean isDefault;

        public static AddressResponse from(Address a) {
            return AddressResponse.builder()
                    .id(a.getId()).label(a.getLabel()).street(a.getStreet())
                    .city(a.getCity()).state(a.getState()).pincode(a.getPincode())
                    .country(a.getCountry()).isDefault(a.getIsDefault()).build();
        }
    }


    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CategoryResponse {
        private Long id;
        private String name;
        private String description;
        private String iconName;
        private String type;

        public static CategoryResponse from(ServiceCategory c) {
            return CategoryResponse.builder()
                    .id(c.getId()).name(c.getName()).description(c.getDescription())
                    .iconName(c.getIconName()).type(c.getType().name()).build();
        }
    }


    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProviderPublicResponse {
        private Long id;
        private Long userId;
        private String fullName;
        private String email;
        private String phone;
        private String city;
        private String description;
        private Integer experienceYears;
        private Double hourlyRate;
        private Double avgRating;
        private Integer totalRatings;
        private Boolean isAvailable;
        private String approvalStatus;
        private List<CategoryResponse> serviceCategories;
        private String profileImagePath;

        public static ProviderPublicResponse from(ServiceProvider sp) {
            return ProviderPublicResponse.builder()
                    .id(sp.getId())
                    .userId(sp.getUser().getId())
                    .fullName(sp.getUser().getFullName())
                    .email(sp.getUser().getEmail())
                    .phone(sp.getUser().getPhone())
                    .city(sp.getCity())
                    .description(sp.getDescription())
                    .experienceYears(sp.getExperienceYears())
                    .hourlyRate(sp.getHourlyRate())
                    .avgRating(sp.getAvgRating())
                    .totalRatings(sp.getTotalRatings())
                    .isAvailable(sp.getIsAvailable())
                    .approvalStatus(sp.getApprovalStatus().name())
                    .serviceCategories(sp.getServiceCategories().stream().map(CategoryResponse::from).toList())
                    .profileImagePath(sp.getProfileImagePath())
                    .build();
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProviderWithCredentials {
        private Long id;
        private Long userId;
        private String fullName;
        private String email;
        private String phone;
        private String city;
        private String description;
        private Integer experienceYears;
        private Double hourlyRate;
        private Double avgRating;
        private Integer totalRatings;
        private Boolean isAvailable;
        private String approvalStatus;
        private List<CategoryResponse> serviceCategories;
        private String profileImagePath;
        private String credentialInfo;
        private String credentialDocument;

        public static ProviderWithCredentials from(ServiceProvider sp) {
            return ProviderWithCredentials.builder()
                    .id(sp.getId())
                    .userId(sp.getUser().getId())
                    .fullName(sp.getUser().getFullName())
                    .email(sp.getUser().getEmail())
                    .phone(sp.getUser().getPhone())
                    .city(sp.getCity())
                    .description(sp.getDescription())
                    .experienceYears(sp.getExperienceYears())
                    .hourlyRate(sp.getHourlyRate())
                    .avgRating(sp.getAvgRating())
                    .totalRatings(sp.getTotalRatings())
                    .isAvailable(sp.getIsAvailable())
                    .approvalStatus(sp.getApprovalStatus().name())
                    .serviceCategories(sp.getServiceCategories().stream().map(CategoryResponse::from).toList())
                    .profileImagePath(sp.getProfileImagePath())
                    .credentialInfo(sp.getCredentialInfo())
                    .credentialDocument(sp.getCredentialDocument())
                    .build();
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UpdateProviderRequest {
        private String description;
        private Integer experienceYears;
        private Double hourlyRate;
        @NotBlank
        private String city;
        private List<Long> serviceCategoryIds;
        private String credentialInfo;
        private Boolean isAvailable;
    }


    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateBookingRequest {
        @NotNull private Long providerId;
        @NotNull private Long categoryId;
        @NotNull private Long addressId;
        @NotNull private LocalDateTime scheduledAt;
        private String notes;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BookingResponse {
        private Long id;
        private Long providerId;
        private String providerName;
        private String categoryName;
        private AddressResponse serviceAddress;
        private LocalDateTime scheduledAt;
        private String notes;
        private String status;
        private Double totalAmount;
        private Boolean credentialsRevealed;
        private String credentialInfo; // only shown when revealed
        private LocalDateTime createdAt;

        public static BookingResponse from(Booking b, boolean includeCredentials) {
            BookingResponse r = BookingResponse.builder()
                    .id(b.getId())
                    .providerId(b.getProvider().getId())
                    .providerName(b.getProvider().getUser().getFullName())
                    .categoryName(b.getServiceCategory().getName())
                    .serviceAddress(AddressResponse.from(b.getServiceAddress()))
                    .scheduledAt(b.getScheduledAt())
                    .notes(b.getNotes())
                    .status(b.getStatus().name())
                    .totalAmount(b.getTotalAmount())
                    .credentialsRevealed(b.getCredentialsRevealed())
                    .createdAt(b.getCreatedAt())
                    .build();
            if (includeCredentials && b.getCredentialsRevealed()) {
                r.setCredentialInfo(b.getProvider().getCredentialInfo());
            }
            return r;
        }
    }


    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateReviewRequest {
        @NotNull private Long bookingId;
        @NotNull @Min(1) @Max(5) private Integer rating;
        private String comment;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ReviewResponse {
        private Long id;
        private String userName;
        private Integer rating;
        private String comment;
        private LocalDateTime createdAt;

        public static ReviewResponse from(Review r) {
            return ReviewResponse.builder()
                    .id(r.getId())
                    .userName(r.getUser().getFullName())
                    .rating(r.getRating())
                    .comment(r.getComment())
                    .createdAt(r.getCreatedAt())
                    .build();
        }
    }


    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AdminStats {
        private long totalUsers;
        private long totalProviders;
        private long pendingProviderApprovals;
        private long totalBookings;
        private long activeBookings;
        private long completedBookings;
    }
}
