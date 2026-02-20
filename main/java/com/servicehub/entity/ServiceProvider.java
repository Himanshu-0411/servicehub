package com.servicehub.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "service_providers")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ServiceProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Integer experienceYears;

    @Column(nullable = false)
    private Double hourlyRate;

    // Credentials - only revealed after booking
    @Column
    private String credentialInfo; // e.g., license number, certificate, contact info

    @Column
    private String credentialDocument; // file path to uploaded document

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "provider_service_categories",
        joinColumns = @JoinColumn(name = "provider_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    private List<ServiceCategory> serviceCategories = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private Double avgRating = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalRatings = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column
    private String profileImagePath;

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private String city;


    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }
}
