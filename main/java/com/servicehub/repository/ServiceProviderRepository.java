package com.servicehub.repository;

import com.servicehub.entity.ServiceProvider;
import com.servicehub.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, Long> {

    Optional<ServiceProvider> findByUser(User user);
    Optional<ServiceProvider> findByUserId(Long userId);

    @Query("SELECT sp FROM ServiceProvider sp " +
           "JOIN sp.serviceCategories sc " +
           "WHERE sp.approvalStatus = 'APPROVED' " +
           "AND sp.isAvailable = true " +
           "AND (:categoryId IS NULL OR sc.id = :categoryId) " +
           "AND (:search IS NULL OR LOWER(sp.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(sp.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<ServiceProvider> findApprovedProviders(
            @Param("categoryId") Long categoryId,
            @Param("search") String search,
            Pageable pageable
    );

    List<ServiceProvider> findByCityIgnoreCase(String city);


    long countByApprovalStatus(ServiceProvider.ApprovalStatus status);
}
