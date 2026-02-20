package com.servicehub.service;

import com.servicehub.dto.ServiceHubDTOs;
import com.servicehub.dto.ServiceHubDTOs.*;
import com.servicehub.entity.ServiceCategory;
import com.servicehub.entity.ServiceProvider;
import com.servicehub.exception.ResourceNotFoundException;
import com.servicehub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProviderService {

    private final ServiceProviderRepository providerRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;

    public Page<ProviderPublicResponse> getApprovedProviders(Long categoryId, String search, Pageable pageable) {
        return providerRepository.findApprovedProviders(categoryId, search, pageable)
                .map(ProviderPublicResponse::from);
    }

    public ProviderPublicResponse getProviderById(Long id) {
        return ProviderPublicResponse.from(findById(id));
    }

    public ProviderPublicResponse getProviderByUserId(Long userId) {
        ServiceProvider provider = providerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));
        return ProviderPublicResponse.from(provider);
    }

    public Page<ReviewResponse> getProviderReviews(Long providerId, Pageable pageable) {
        return reviewRepository.findByProviderId(providerId, pageable).map(ReviewResponse::from);
    }

    @Transactional
    public ProviderPublicResponse updateProfile(Long userId, UpdateProviderRequest req) {
        ServiceProvider provider = providerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        if (req.getDescription() != null) provider.setDescription(req.getDescription());
        if (req.getExperienceYears() != null) provider.setExperienceYears(req.getExperienceYears());
        if (req.getHourlyRate() != null) provider.setHourlyRate(req.getHourlyRate());
        if (req.getCredentialInfo() != null) provider.setCredentialInfo(req.getCredentialInfo());
        if (req.getIsAvailable() != null) provider.setIsAvailable(req.getIsAvailable());

        if (req.getServiceCategoryIds() != null) {
            List<ServiceCategory> cats = categoryRepository.findAllById(req.getServiceCategoryIds());
            provider.setServiceCategories(cats);
        }

        providerRepository.save(provider);
        return ProviderPublicResponse.from(provider);
    }

    private ServiceProvider findById(Long id) {
        return providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
    }

    public List<ServiceHubDTOs.ProviderPublicResponse> getProvidersByCity(String city) {
        return providerRepository.findByCityIgnoreCase(city)
                .stream()
                .map(ServiceHubDTOs.ProviderPublicResponse::from)
                .toList();
    }

}
