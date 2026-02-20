package com.servicehub.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "service_categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ServiceCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column
    private String description;

    @Column
    private String iconName; // lucide icon name for frontend

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoryType type;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @ManyToMany(mappedBy = "serviceCategories")
    @Builder.Default
    private List<ServiceProvider> providers = new ArrayList<>();

    public enum CategoryType {
        HOME_SERVICES,      // Plumbing, Electrical, Carpentry, etc.
        TUTORING_EDUCATION, // Math, Science, Language, etc.
        BEAUTY_WELLNESS,    // Salon, Spa, etc.
        OTHER
    }
}
