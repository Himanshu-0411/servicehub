package com.servicehub.service;

import com.servicehub.dto.ServiceHubDTOs.*;
import com.servicehub.entity.Booking;
import com.servicehub.entity.ServiceCategory;
import com.servicehub.entity.ServiceProvider;
import com.servicehub.entity.User;
import com.servicehub.exception.ResourceNotFoundException;
import com.servicehub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ServiceProviderRepository providerRepository;
    private final BookingRepository bookingRepository;
    private final ServiceCategoryRepository categoryRepository;

    public AdminStats getDashboardStats() {
        return AdminStats.builder()
                .totalUsers(userRepository.countByRole(User.Role.USER))
                .totalProviders(userRepository.countByRole(User.Role.PROVIDER))
                .pendingProviderApprovals(providerRepository.countByApprovalStatus(ServiceProvider.ApprovalStatus.PENDING))
                .totalBookings(bookingRepository.count())
                .activeBookings(bookingRepository.countByStatus(Booking.BookingStatus.CONFIRMED) +
                        bookingRepository.countByStatus(Booking.BookingStatus.IN_PROGRESS))
                .completedBookings(bookingRepository.countByStatus(Booking.BookingStatus.COMPLETED))
                .build();
    }

    public Page<ProviderPublicResponse> getAllProviders(Pageable pageable) {
        return providerRepository.findAll(pageable).map(ProviderPublicResponse::from);
    }

    @Transactional
    public ProviderPublicResponse approveProvider(Long providerId) {
        ServiceProvider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        provider.setApprovalStatus(ServiceProvider.ApprovalStatus.APPROVED);
        provider.getUser().setStatus(User.AccountStatus.ACTIVE);
        userRepository.save(provider.getUser());
        providerRepository.save(provider);
        return ProviderPublicResponse.from(provider);
    }

    @Transactional
    public ProviderPublicResponse rejectProvider(Long providerId) {
        ServiceProvider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        provider.setApprovalStatus(ServiceProvider.ApprovalStatus.REJECTED);
        providerRepository.save(provider);
        return ProviderPublicResponse.from(provider);
    }

    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(user.getStatus() == User.AccountStatus.ACTIVE
                ? User.AccountStatus.SUSPENDED : User.AccountStatus.ACTIVE);
        userRepository.save(user);
    }

    public Page<BookingResponse> getAllBookings(Pageable pageable) {
        return bookingRepository.findAll(pageable)
                .map(b -> BookingResponse.from(b, false));
    }

    // Category Management
    @Transactional
    public CategoryResponse createCategory(String name, String description,
                                           String iconName, String type) {
        ServiceCategory cat = ServiceCategory.builder()
                .name(name).description(description)
                .iconName(iconName)
                .type(ServiceCategory.CategoryType.valueOf(type))
                .build();
        categoryRepository.save(cat);
        return CategoryResponse.from(cat);
    }

    @Transactional
    public void toggleCategory(Long categoryId) {
        ServiceCategory cat = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        cat.setIsActive(!cat.getIsActive());
        categoryRepository.save(cat);
    }
}
