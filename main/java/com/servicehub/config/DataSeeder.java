package com.servicehub.config;

import com.servicehub.entity.ServiceCategory;
import com.servicehub.entity.User;
import com.servicehub.repository.ServiceCategoryRepository;
import com.servicehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedCategories();
    }

    private void seedAdmin() {
        if (!userRepository.existsByEmail("admin@servicehub.com")) {
            User admin = User.builder()
                    .fullName("System Admin")
                    .email("admin@servicehub.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .phone("9999999999")
                    .role(User.Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("✅ Admin user created: admin@servicehub.com / Admin@123");
        }
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            List<ServiceCategory> categories = List.of(
                // Home Services
                ServiceCategory.builder().name("Plumbing").description("Pipe repairs, leaks, installations")
                        .iconName("Droplets").type(ServiceCategory.CategoryType.HOME_SERVICES).build(),
                ServiceCategory.builder().name("Electrical").description("Wiring, switches, appliance repairs")
                        .iconName("Zap").type(ServiceCategory.CategoryType.HOME_SERVICES).build(),
                ServiceCategory.builder().name("Carpentry").description("Furniture, doors, woodwork")
                        .iconName("Hammer").type(ServiceCategory.CategoryType.HOME_SERVICES).build(),
                ServiceCategory.builder().name("Cleaning").description("Deep cleaning, regular maintenance")
                        .iconName("Sparkles").type(ServiceCategory.CategoryType.HOME_SERVICES).build(),
                ServiceCategory.builder().name("Painting").description("Interior and exterior painting")
                        .iconName("Paintbrush").type(ServiceCategory.CategoryType.HOME_SERVICES).build(),
                ServiceCategory.builder().name("AC Repair").description("AC service, installation, repair")
                        .iconName("Wind").type(ServiceCategory.CategoryType.HOME_SERVICES).build(),

                // Tutoring & Education
                ServiceCategory.builder().name("Mathematics").description("Primary to advanced math tutoring")
                        .iconName("Calculator").type(ServiceCategory.CategoryType.TUTORING_EDUCATION).build(),
                ServiceCategory.builder().name("Science").description("Physics, Chemistry, Biology")
                        .iconName("FlaskConical").type(ServiceCategory.CategoryType.TUTORING_EDUCATION).build(),
                ServiceCategory.builder().name("English").description("Language, grammar, writing skills")
                        .iconName("BookOpen").type(ServiceCategory.CategoryType.TUTORING_EDUCATION).build(),
                ServiceCategory.builder().name("Computer Science").description("Programming, web dev, data science")
                        .iconName("Code").type(ServiceCategory.CategoryType.TUTORING_EDUCATION).build(),

                // Other
                ServiceCategory.builder().name("Beauty & Wellness").description("Salon, spa, grooming services")
                        .iconName("Scissors").type(ServiceCategory.CategoryType.BEAUTY_WELLNESS).build(),
                ServiceCategory.builder().name("Photography").description("Events, portraits, product photos")
                        .iconName("Camera").type(ServiceCategory.CategoryType.OTHER).build()
            );
            categoryRepository.saveAll(categories);
            log.info("✅ {} service categories seeded", categories.size());
        }
    }
}
